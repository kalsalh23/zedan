// Final img + seed-blobs functions using the anon key (RLS policies are public)
const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycHlzc3psc2Z5bWt5ZmxscmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzg2MDcsImV4cCI6MjEwNTU1NDYwN30.H3t0Mnc_AgOctFmoNS7iK7lKljiTNLd5FaEii9OrsFI'

const imgFn = `// img: serve self-hosted images — use ?path= style (subpaths not routed by the gateway)
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const raw = url.pathname
  const idx = raw.indexOf('/img/')
  let p = idx >= 0 ? decodeURIComponent(raw.slice(idx + 5)) : url.searchParams.get('path') || ''
  p = p.replace(/\\/+$/, '')
  if (!p) return new Response('not found', { status: 404 })
  const rest = \`\${Deno.env.get('SUPABASE_URL')}/rest/v1/image_blobs?select=mime,data&path=eq.\${encodeURIComponent(p)}&limit=1\`
  const r = await fetch(rest, { headers: { apikey: '\`${ANON}\`', Authorization: 'Bearer \`${ANON}\`' } })
  const rows = await r.json()
  const row = Array.isArray(rows) ? rows[0] : null
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

async function main() {
  const fd = new FormData()
  fd.append(
    'metadata',
    new Blob([JSON.stringify({ name: 'img', entrypoint_path: 'index.ts', verify_jwt: false })], { type: 'application/json' })
  )
  fd.append('file', new Blob([imgFn], { type: 'text/typescript' }), 'index.ts')
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=img`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  })
  console.log('deploy →', res.status, (await res.text()).slice(0, 100))
}

main().catch((e) => { console.error(e); process.exit(1) })
