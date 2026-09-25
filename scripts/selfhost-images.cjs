// Uploads images into Supabase Storage via an Edge Function (bypasses anon-key RLS)
const fs = require('fs')
const path = require('path')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN
const FN = `https://${REF}.supabase.co/functions/v1/seed-images`

function fnSource() {
  return `// seed-images: writes an image into the public product-images bucket (service role)
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  try {
    const { path: p, base64 } = await req.json()
    if (!p || !base64) return new Response('bad body', { status: 400 })
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const up = await fetch(
      \`\${Deno.env.get('SUPABASE_URL')}/storage/v1/object/product-images/\${p}\`,
      {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}\`,
          'Content-Type': 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: bytes,
      }
    )
    return new Response(JSON.stringify({ ok: up.ok, status: up.status, path: p }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
})
`
}

async function deploy() {
  const fd = new FormData()
  fd.append(
    'metadata',
    new Blob([JSON.stringify({ name: 'seed-images', entrypoint_path: 'index.ts', verify_jwt: false })], { type: 'application/json' })
  )
  fd.append('file', new Blob([fnSource()], { type: 'text/typescript' }), 'index.ts')
  let res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=seed-images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  })
  let text = await res.text()
  console.log('deploy →', res.status, text.slice(0, 200))
  if (res.status >= 300) {
    // fallback: legacy create
    res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'seed-images', name: 'seed-images', verify_jwt: false, body: fnSource() }),
    })
    console.log('legacy →', res.status, (await res.text()).slice(0, 200))
  }
}

async function get(url) {
  const r = await fetch(url)
  if (!r.ok) return null
  const buf = Buffer.from(await r.arrayBuffer())
  return buf
}

async function main() {
  await deploy()
  const pools = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified-images.json'), 'utf8'))
  const seen = new Set()
  let ok = 0
  let fail = 0
  for (const [cat, urls] of Object.entries(pools)) {
    for (const url of urls) {
      const name = url.split('/').slice(-2).join('-') // e.g. iphone-13-pro-1.webp
      const dest = `img/${cat}/${name}`
      if (seen.has(dest)) continue
      seen.add(dest)
      const buf = await get(url)
      if (!buf) {
        fail++
        continue
      }
      try {
        const r = await fetch(FN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: dest, base64: buf.toString('base64') }),
        })
        const j = await r.json()
        if (j.ok) ok++
        else {
          fail++
          console.log('upload fail', dest, JSON.stringify(j))
        }
      } catch (e) {
        fail++
        console.log('req fail', dest, e.message)
      }
    }
  }
  console.log('uploaded:', ok, 'failed:', fail)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
