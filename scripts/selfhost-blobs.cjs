// Deploys blob store + serve functions, then uploads all verified images into the DB
const fs = require('fs')
const path = require('path')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN
const BASE = `https://${REF}.supabase.co`
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycHlzc3psc2Z5bWt5ZmxscmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzg2MDcsImV4cCI6MjEwNTU1NDYwN30.H3t0Mnc_AgOctFmoNS7iK7lKljiTNLd5FaEii9OrsFI'

const seedFn = `// seed-blobs: upsert an image blob (path, mime, data)
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  try {
    const { path: p, base64, mime } = await req.json()
    if (!p || !base64 || base64.length > 400_000) return new Response('bad body', { status: 400 })
    const bytes = Math.floor(base64.length * 0.75)
    const rest = \`\${Deno.env.get('SUPABASE_URL')}/rest/v1/image_blobs\`
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '\`${ANON}\`'
    const up = await fetch(rest, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: \`Bearer \${key}\`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ path: p, mime: mime || 'image/webp', data: base64, bytes }),
    })
    const err = up.ok ? '' : (await up.text()).slice(0, 200)
    return new Response(JSON.stringify({ ok: up.ok, status: up.status, path: p, bytes, err }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
})
`

const imgFn = `// img: serve self-hosted images with immutable caching — /functions/v1/img/<path>
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const p = decodeURIComponent(url.pathname.replace(/^\\/functions\\/v1\\/img\\/?/, ''))
  if (!p) return new Response('not found', { status: 404 })
  const rest = \`\${Deno.env.get('SUPABASE_URL')}/rest/v1/image_blobs?select=mime,data&path=eq.\${encodeURIComponent(p)}&limit=1\`
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '\`${ANON}\`'
  const r = await fetch(rest, { headers: { apikey: key, Authorization: \`Bearer \${key}\` } })
  const rows = await r.json()
  const row = rows?.[0]
  if (!row) return new Response('not found', { status: 404 })
  const bytes = Uint8Array.from(atob(row.data), (c) => c.charCodeAt(0))
  return new Response(bytes, {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
`

async function deployFn(name, source) {
  const fd = new FormData()
  fd.append(
    'metadata',
    new Blob([JSON.stringify({ name, entrypoint_path: 'index.ts', verify_jwt: false })], { type: 'application/json' })
  )
  fd.append('file', new Blob([source], { type: 'text/typescript' }), 'index.ts')
  let res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=${name}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  })
  const text = await res.text()
  console.log(`deploy ${name} →`, res.status, text.slice(0, 100))
  if (res.status >= 300) {
    res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: name, name, verify_jwt: false, body: source }),
    })
    console.log(`legacy ${name} →`, res.status, (await res.text()).slice(0, 120))
  }
}

async function main() {
  // 1) table
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'image-blobs.sql'), 'utf8')
  const q = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  console.log('table →', q.status, (await q.text()).slice(0, 100))

  // 2) functions
  await deployFn('seed-blobs', seedFn)
  await deployFn('img', imgFn)

  // 3) upload all images
  const pools = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified-images.json'), 'utf8'))
  const seen = new Set()
  let ok = 0
  let fail = 0
  const failed = []
  for (const [cat, urls] of Object.entries(pools)) {
    for (const url of urls) {
      const name = url.split('/').slice(-2).join('-').replace(/'/g, '')
      const dest = `img/${cat}/${name}`
      if (seen.has(dest)) continue
      seen.add(dest)
      try {
        const r = await fetch(url)
        if (!r.ok) { fail++; failed.push(dest); continue }
        const buf = Buffer.from(await r.arrayBuffer())
        const res = await fetch(`${BASE}/functions/v1/seed-blobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: dest, base64: buf.toString('base64'), mime: 'image/webp' }),
        })
        const j = await res.json()
        if (j.ok) ok++
        else { fail++; failed.push(dest); console.log('fail', dest, j.err || j.error) }
      } catch (e) {
        fail++
        failed.push(dest)
        console.log('req fail', dest, e.message)
      }
    }
  }
  console.log('uploaded:', ok, 'failed:', fail, failed.slice(0, 5))

  // 4) sanity: serve one
  const probe = await fetch(`${BASE}/functions/v1/img/phones/${[...seen].find((s) => s.includes('phones'))?.split('/').pop()}`)
  console.log('serve probe:', probe.status, probe.headers.get('content-type'), (await probe.arrayBuffer()).byteLength, 'bytes')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
