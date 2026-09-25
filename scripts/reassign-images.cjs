// Assigns verified images to every product (round-robin per category) and emits one SQL UPDATE
const fs = require('fs')

const pools = JSON.parse(fs.readFileSync(__dirname + '/verified-images.json', 'utf8'))

const esc = (s) => s.replace(/'/g, "''")
// deterministic rotation so related devices get different views
const pick = (pool, i) => pool[((i % pool.length) + pool.length) % pool.length]

// brand-aware pools for used items (from product name)
const poolForName = (name) => {
  if (/watch/i.test(name)) return pools.watches
  if (/ipad|tab|pad/i.test(name)) return pools.tablets
  return pools.phones
}

function buildRows() {
  const counters = {}
  const bump = (k) => (counters[k] = (counters[k] || 0) + 1)
  return { counters }
}

const assignments = [] // [slug, img]

// Categories stored in DB -> pool key
const CAT_POOL = {
  smartphones: 'phones',
  tablets: 'tablets',
  audio: 'audio',
  chargers: 'chargers',
  cases: 'cases',
  watches: 'watches',
  accessories: 'accessories',
}

// We don't have DB rows locally — read them via a previously exported list? Instead:
// generate SQL that assigns by row_number within category using the pool — done in SQL directly.
// Safer approach: fetch products via REST, assign here, emit exact UPDATEs.
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycHlzc3psc2Z5bWt5ZmxscmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzg2MDcsImV4cCI6MjEwNTU1NDYwN30.H3t0Mnc_AgOctFmoNS7iK7lKljiTNLd5FaEii9OrsFI'

async function fetchAll() {
  let from = 0
  const all = []
  while (true) {
    const r = await fetch(
      `https://vrpysszlsfymkyfllrdg.supabase.co/rest/v1/products?select=slug,name,category_id,condition&order=created_at&id.gt.${from ? encodeURIComponent(from) : '00000000-0000-0000-0000-000000000000'}&limit=1000`,
      { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } }
    ).then((r) => r.json())
    if (!Array.isArray(r) || r.length === 0) break
    all.push(...r)
    from = r[r.length - 1].slug // not used; pagination via range instead
    break
  }
  // simpler: single range request for everything
  if (all.length === 0) {
    const r2 = await fetch(
      'https://vrpysszlsfymkyfllrdg.supabase.co/rest/v1/products?select=slug,name,category_id,condition&limit=1000',
      { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } }
    ).then((r) => r.json())
    return r2
  }
  return all
}

async function fetchCategories() {
  const r = await fetch('https://vrpysszlsfymkyfllrdg.supabase.co/rest/v1/categories?select=id,slug,image_url', {
    headers: { apikey: ANON, Authorization: 'Bearer ' + ANON },
  })
  return r.json()
}

async function main() {
  const [products, cats] = await Promise.all([fetchAll(), fetchCategories()])
  const catById = Object.fromEntries(cats.map((c) => [c.id, c.slug]))
  console.log('products:', products.length)

  const counters = {}
  const values = []
  for (const p of products) {
    const catSlug = catById[p.category_id]
    let poolKey = CAT_POOL[catSlug]
    if (p.condition === 'used') poolKey = poolForName(p.name) === pools.tablets ? 'tablets' : poolForName(p.name) === pools.watches ? 'watches' : 'phones'
    if (!poolKey || !pools[poolKey]?.length) poolKey = 'phones'
    const i = counters[poolKey] = (counters[poolKey] || 0) + 1
    values.push(`('${esc(p.slug)}','${esc(pick(pools[poolKey], i - 1))}')`)
  }

  const sql = `update public.products p set main_image = v.img, updated_at = now()
from (values\n${values.join(',\n')}\n) as v(slug,img)
where p.slug = v.slug;

update public.categories set image_url = case slug
  when 'smartphones' then '${pools.phones[0]}'
  when 'tablets' then '${pools.tablets[0]}'
  when 'used' then '${pools.phones[1]}'
  when 'audio' then '${pools.audio[0]}'
  when 'chargers' then '${pools.chargers[0]}'
  when 'cases' then '${pools.cases[0]}'
  when 'watches' then '${pools.watches[0]}'
  when 'accessories' then '${pools.accessories[0]}'
end;

select main_image, count(*) from public.products group by main_image order by count(*) desc limit 5;`

  fs.writeFileSync(__dirname + '/../supabase/reassign-images.sql', sql)
  console.log('reassign-images.sql written,', values.length, 'rows')
}

main().catch((e) => { console.error(e); process.exit(1) })
