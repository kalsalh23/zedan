// Stores VAPID secrets in Supabase and deploys the push-send Edge Function
const fs = require('fs')
const path = require('path')
const https = require('https')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN

const SECRETS = [
  { name: 'VAPID_PUBLIC_KEY', value: 'BPAFVHMrjNKi57FVXxM8VkuvetSoXcghK60DNkpi9F7I_LXjvn1ORUDl_kCxPzZneaRffu4tS4ozEU5NdNWIIjE' },
  { name: 'VAPID_PRIVATE_KEY', value: '299kj72dnHZrm9SpgWnBjOUMpj8GtG9oDzzY4TELEVc' },
  { name: 'VAPID_SUBJECT', value: 'mailto:rainman180.ayman@gmail.com' },
]

function call(method, p, body, isMultipart, boundary) {
  return new Promise((resolve, reject) => {
    const payload = body
    const headers = { Authorization: `Bearer ${TOKEN}` }
    if (isMultipart) headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary
    else if (body) headers['Content-Type'] = 'application/json'
    const req = https.request({ hostname: 'api.supabase.com', path: p, method, headers }, (res) => {
      let b = ''
      res.on('data', (c) => (b += c))
      res.on('end', () => {
        const out = b.length > 1500 ? b.slice(0, 1500) + '…TRUNC' : b
        console.log(method, p, '→', res.statusCode, out)
        resolve({ status: res.statusCode, body: out })
      })
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

async function main() {
  // 1) secrets
  await call('POST', `/v1/projects/${REF}/secrets`, JSON.stringify(SECRETS))

  // 2) deploy function (multipart deploy endpoint, used by the official CLI)
  const src = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', 'push-send', 'index.ts'), 'utf8')
  const boundary = '----zedan' + Date.now()
  const meta = JSON.stringify({
    name: 'push-send',
    entrypoint_path: 'index.ts',
    verify_jwt: false,
  })

  const parts = []
  parts.push(
    `--${boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n${meta}\r\n`
  )
  parts.push(
    `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="index.ts"\r\nContent-Type: text/typescript\r\n\r\n${src}\r\n`
  )
  parts.push(`--${boundary}--\r\n`)
  const body = parts.join('')

  await call('POST', `/v1/projects/${REF}/functions/deploy?slug=push-send`, Buffer.from(body, 'utf8'), true, boundary)
}

main().catch((e) => {
  console.error('FAIL', e.message)
  process.exit(1)
})
