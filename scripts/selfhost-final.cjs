// img v5 final (no debug) + reassign all product/category images to self-hosted URLs
const fs = require('fs')
const path = require('path')

const REF = 'vrpysszlsfymkyfllrdg'
const TOKEN = process.env.SUPA_TOKEN
const BASE = `https://${REF}.supabase.co`

const imgFn = `// img: serve self-hosted images with immutable caching — /functions/v1/img?path=img/...
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  let p = url.searchParams.get('path') || ''
  if (!p.startsWith('img/')) p = 'img/' + p
  p = p.replace(/\\/+$/, '')
  if (p === 'img/') return new Response('not found', { status: 404 })
  const rest = \`\${Deno.env.get('SUPABASE_URL')}/rest/v1/image_blobs?select=mime,data&path=eq.\${encodeURIComponent(p)}&limit=1\`
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const r = await fetch(rest, { headers: { apikey: key, Authorization: \`Bearer \${key}\` } })
  const body = await r.text()
  let rows: unknown = null
  try { rows = JSON.parse(body) } catch { rows = null }
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

async function deployImg() {
  const fd = new FormData()
  fd.append('metadata', new Blob([JSON.stringify({ name: 'img', entrypoint_path: 'index.ts', verify_jwt: false })], { type: 'application/json' }))
  fd.append('file', new Blob([imgFn], { type: 'text/typescript' }), 'index.ts')
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=img`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  })
  console.log('img deploy →', res.status)
}

const selfUrl = (dest) => `${BASE}/functions/v1/img?path=${encodeURIComponent(dest)}`
const esc = (s) => s.replace(/'/g, "''")

const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycHlzc3psc2Z5bWt5ZmxscmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzg2MDcsImV4cCI6MjEwNTU1NDYwN30.H3t0Mnc_AgOctFmoNS7iK7lKljiTNLd5FaEii9OrsFI'

async function main() {
  await deployImg()

  const pools = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified-images.json'), 'utf8'))

  // map verified dummyjson URLs -> self-hosted dest
  const poolSelf = {}
  for (const [cat, urls] of Object.entries(pools)) {
    poolSelf[cat] = urls.map((u) => selfUrl(`img/${cat}/${u.split('/').slice(-2).join('-').replace(/'/g, '')}`))
  }

  // fetch products + categories
  const H = { apikey: ANON, Authorization: 'Bearer ' + ANON }
  const [products, cats] = await Promise.all([
    fetch(`${BASE}/rest/v1/products?select=slug,name,category_id,condition&limit=1000`, { headers: H }).then((r) => r.json()),
    fetch(`${BASE}/rest/v1/categories?select=id,slug`, { headers: H }).then((r) => r.json()),
  ])
  const catById = Object.fromEntries(cats.map((c) => [c.id, c.slug]))

  const CAT_POOL = { smartphones: 'phones', tablets: 'tablets', audio: 'audio', chargers: 'chargers', cases: 'cases', watches: 'watches', accessories: 'accessories' }
  const counters = {}
  const values = []
  for (const p of products) {
    const catSlug = catById[p.category_id]
    let poolKey = CAT_POOL[catSlug]
    if (p.condition === 'used') {
      if (/watch/i.test(p.name)) poolKey = 'watches'
      else if (/ipad|tab|pad/i.test(p.name)) poolKey = 'tablets'
      else poolKey = 'phones'
    }
    if (!poolKey || !poolSelf[poolKey]?.length) poolKey = 'phones'
    const i = (counters[poolKey] = (counters[poolKey] || 0) + 1)
    values.push(`('${esc(p.slug)}','${esc(poolSelf[poolKey][(i - 1) % poolSelf[poolKey].length])}')`)
  }

  const sql = `update public.products p set main_image = v.img, updated_at = now()
from (values\n${values.join(',\n')}\n) as v(slug,img)
where p.slug = v.slug;

update public.categories set image_url = case slug
  when 'smartphones' then '${poolSelf.phones[0]}'
  when 'tablets' then '${poolSelf.tablets[0]}'
  when 'used' then '${poolSelf.phones[1]}'
  when 'audio' then '${poolSelf.audio[0]}'
  when 'chargers' then '${poolSelf.chargers[0]}'
  when 'cases' then '${poolSelf.cases[0]}'
  when 'watches' then '${poolSelf.watches[0]}'
  when 'accessories' then '${poolSelf.accessories[0]}'
end;

select count(*) as self_hosted from public.products where main_image like '%/functions/v1/img%';`

  fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'reassign-selfhosted.sql'), sql)
  const q = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  console.log('reassign →', q.status, (await q.text()).slice(0, 200))
}

main().catch((e) => { console.error(e); process.exit(1) })
