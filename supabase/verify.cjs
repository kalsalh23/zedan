const https = require('https')

const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycHlzc3psc2Z5bWt5ZmxscmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzg2MDcsImV4cCI6MjEwNTU1NDYwN30.H3t0Mnc_AgOctFmoNS7iK7lKljiTNLd5FaEii9OrsFI'

function get(path) {
  return new Promise((resolve) => {
    https
      .get(
        {
          hostname: 'vrpysszlsfymkyfllrdg.supabase.co',
          path,
          headers: { apikey: ANON, Authorization: 'Bearer ' + ANON },
        },
        (res) => {
          let b = ''
          res.on('data', (c) => (b += c))
          res.on('end', () => resolve({ status: res.statusCode, body: b }))
        }
      )
      .on('error', (e) => resolve({ status: 'ERR', body: e.message }))
  })
}

;(async () => {
  const r1 = await get('/rest/v1/products?select=name,price,condition&limit=3')
  console.log('PRODUCTS', r1.status, r1.body.slice(0, 400))
  const r2 = await get('/rest/v1/categories?select=slug,name&limit=3')
  console.log('CATEGORIES', r2.status, r2.body.slice(0, 300))
})()
