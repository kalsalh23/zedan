// img v4 with debug output to find why the lookup fails inside the function
const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN

const imgFn = `// img v4 (debug)
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  let p = url.searchParams.get('path') || ''
  p = p.replace(/\\/+$/, '')
  const dbg = url.searchParams.get('dbg') === '1'
  if (!p) return new Response('not found (no path)', { status: 404 })
  const rest = \`\${Deno.env.get('SUPABASE_URL')}/rest/v1/image_blobs?select=mime,data&path=eq.\${encodeURIComponent(p)}&limit=1\`
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const r = await fetch(rest, { headers: { apikey: key, Authorization: \`Bearer \${key}\` } })
  const body = await r.text()
  if (dbg) return new Response(JSON.stringify({ status: r.status, body: body.slice(0, 300), p, hasKey: !!key, keyPrefix: key.slice(0, 10), url: rest.slice(0, 160) }), { headers: { 'Content-Type': 'application/json' } })
  let rows: unknown = null
  try { rows = JSON.parse(body) } catch { rows = null }
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row) return new Response('not found (db)', { status: 404 })
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
  fd.append('metadata', new Blob([JSON.stringify({ name: 'img', entrypoint_path: 'index.ts', verify_jwt: false })], { type: 'application/json' }))
  fd.append('file', new Blob([imgFn], { type: 'text/typescript' }), 'index.ts')
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=img`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  })
  console.log('deploy →', res.status, (await res.text()).slice(0, 80))
}

main().catch((e) => { console.error(e); process.exit(1) })
