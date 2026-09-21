// Deploys the push-send Edge Function using Node's native FormData + fetch
const fs = require('fs')
const path = require('path')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN

async function main() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', 'push-send', 'index.ts'), 'utf8')

  const fd = new FormData()
  fd.append(
    'metadata',
    new Blob([JSON.stringify({ name: 'push-send', entrypoint_path: 'index.ts', verify_jwt: false })], {
      type: 'application/json',
    }),
    'metadata'
  )
  fd.append('files', new Blob([src], { type: 'text/typescript' }), 'index.ts')

  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=push-send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  })
  const text = await res.text()
  console.log('deploy →', res.status, text.slice(0, 1200))
  if (res.status >= 300) process.exit(1)
}

main().catch((e) => {
  console.error('FAIL', e.message)
  process.exit(1)
})
