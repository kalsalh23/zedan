// Uploads images into Supabase Storage via an Edge Function — v2 with verbose errors
const fs = require('fs')
const path = require('path')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN
const FN = `https://${REF}.supabase.co/functions/v1/seed-images`

function fnSource() {
  return `// seed-images v2: write image into product-images bucket, verbose errors
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  try {
    const { path: p, base64, mode } = await req.json()
    if (!p || !base64) return new Response('bad body', { status: 400 })
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const base = \`\${Deno.env.get('SUPABASE_URL')}/storage/v1\`
    let up: Response
    if (mode === 'form') {
      const fd = new FormData()
      fd.append('file', new Blob([bytes]), p.split('/').pop())
      up = await fetch(\`\${base}/object/product-images/\${p}\`, {
        method: 'POST',
        headers: { Authorization: \`Bearer \${key}\`, 'x-upsert': 'true' },
        body: fd,
      })
    } else {
      up = await fetch(\`\${base}/object/product-images/\${p}\`, {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${key}\`,
          'Content-Type': 'application/octet-stream',
          'cache-control': '3600',
          'x-upsert': 'true',
        },
        body: bytes,
      })
    }
    const errText = up.ok ? '' : (await up.text()).slice(0, 300)
    return new Response(JSON.stringify({ ok: up.ok, status: up.status, path: p, err: errText }), {
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
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=seed-images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  })
  console.log('deploy →', res.status, (await res.text()).slice(0, 150))
}

async function main() {
  await deploy()
  // single test with both modes
  const testUrl = 'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp'
  const buf = Buffer.from(await (await fetch(testUrl)).arrayBuffer())
  for (const mode of ['raw', 'form']) {
    const r = await fetch(FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `img/test-${mode}.webp`, base64: buf.toString('base64'), mode }),
    })
    console.log(mode, '→', await r.text())
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
