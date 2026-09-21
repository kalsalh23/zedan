// Runs a SQL file against the Supabase project via the Management API
const fs = require('fs')
const https = require('https')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN
const file = process.argv[2]

const sql = fs.readFileSync(file, 'utf8')
const payload = JSON.stringify({ query: sql })

const req = https.request(
  {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${REF}/database/query`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  },
  (res) => {
    let body = ''
    res.on('data', (c) => (body += c))
    res.on('end', () => {
      console.log('STATUS', res.statusCode)
      const out = body.length > 4000 ? body.slice(0, 4000) + '\n...TRUNCATED' : body
      console.log(out)
      if (res.statusCode !== 200) process.exit(1)
    })
  }
)
req.on('error', (e) => { console.error('ERR', e.message); process.exit(1) })
req.write(payload)
req.end()
