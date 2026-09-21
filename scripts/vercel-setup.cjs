// Creates the Vercel project and sets environment variables via the REST API
const https = require('https')

const TOKEN = process.env.VERCEL_TOKEN
const NAME = 'mobily-bro'
const ENV = {
  VITE_SUPABASE_URL: 'https://vrpysszlsfymkyfllrdg.supabase.co',
  VITE_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycHlzc3psc2Z5bWt5ZmxscmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzg2MDcsImV4cCI6MjEwNTU1NDYwN30.H3t0Mnc_AgOctFmoNS7iK7lKljiTNLd5FaEii9OrsFI',
}

function api(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = https.request(
      {
        hostname: 'api.vercel.com',
        path: p,
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let b = ''
        res.on('data', (c) => (b += c))
        res.on('end', () => {
          if (res.statusCode >= 300) {
            const err = new Error(`${res.statusCode} ${b.slice(0, 400)}`)
            err.status = res.statusCode
            reject(err)
          } else resolve(b ? JSON.parse(b) : {})
        })
      }
    )
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function main() {
  let project
  try {
    project = await api('POST', '/v9/projects', { name: NAME, framework: 'vite' })
    console.log('project created:', project.name)
  } catch (e) {
    if (e.status === 409) {
      project = await api('GET', `/v9/projects/${NAME}`)
      console.log('project already exists:', project.name)
    } else throw e
  }

  const existing = await api('GET', `/v9/projects/${NAME}/env`)
  const have = new Set((existing.envs || []).map((e) => e.key))
  for (const [key, value] of Object.entries(ENV)) {
    if (have.has(key)) {
      console.log('env exists:', key)
      continue
    }
    await api('POST', `/v9/projects/${NAME}/env`, {
      key,
      value,
      type: 'encrypted',
      target: ['production', 'preview'],
    })
    console.log('env added:', key)
  }
  console.log('setup done')
}

main().catch((e) => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
