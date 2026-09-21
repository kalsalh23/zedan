// Tries the known function-deploy API variants until one works
const fs = require('fs')
const path = require('path')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN
const src = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', 'push-send', 'index.ts'), 'utf8')
const meta = JSON.stringify({ name: 'push-send', entrypoint_path: 'index.ts', verify_jwt: false })

async function tryVariant(label, url, opts) {
  try {
    const res = await fetch(url, opts)
    const text = await res.text()
    console.log(label, '→', res.status, text.slice(0, 300))
    return res.status < 300
  } catch (e) {
    console.log(label, '→ ERR', e.message)
    return false
  }
}

async function main() {
  const base = `https://api.supabase.com/v1/projects/${REF}/functions`

  // 1) legacy JSON create
  if (await tryVariant('legacy-create', base, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'push-send', name: 'push-send', verify_jwt: false, body: src }),
  })) return

  // 2) legacy JSON update (function may already exist from a partial create)
  if (await tryVariant('legacy-update', `${base}/push-send`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: src, verify_jwt: false }),
  })) return

  // 3) multipart deploy with single 'file' field
  {
    const fd = new FormData()
    fd.append('metadata', new Blob([meta], { type: 'application/json' }))
    fd.append('file', new Blob([src], { type: 'text/typescript' }), 'index.ts')
    if (await tryVariant('deploy-file', `${base}/deploy?slug=push-send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: fd,
    })) return
  }

  // 4) multipart deploy with filename-only field names
  {
    const fd = new FormData()
    fd.append('metadata', new Blob([meta], { type: 'application/json' }))
    fd.append('index.ts', new Blob([src], { type: 'text/typescript' }), 'index.ts')
    if (await tryVariant('deploy-namedfield', `${base}/deploy?slug=push-send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: fd,
    })) return
  }

  console.log('ALL VARIANTS FAILED')
  process.exit(1)
}

main()
