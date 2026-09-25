// Builds VERIFIED image pools: fetches real product images from dummyjson API,
// probes every URL, dedupes by content hash, and drops the "broken file" placeholder.
const crypto = require('crypto')
const https = require('https')

function get(url, binary) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        res.resume()
        return resolve(null)
      }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({ buf: Buffer.concat(chunks), type: res.headers['content-type'] }))
    }).on('error', () => resolve(null))
  })
}

async function main() {
  const cats = ['smartphones', 'tablets', 'mobile-accessories', 'mens-watches', 'womens-watches']
  const all = []
  for (const c of cats) {
    const d = await get(`https://dummyjson.com/products/category/${c}?select=title,images&limit=0`).then((r) => JSON.parse(r.buf))
    for (const p of d.products || []) for (const img of p.images || []) all.push(img)
  }
  console.log('candidate urls:', all.length)

  const byHash = new Map()
  let brokenHash = null
  let checked = 0
  const seen = new Set()
  for (const url of all) {
    if (seen.has(url)) continue
    seen.add(url)
    const r = await get(url, true)
    checked++
    if (!r || !r.type.startsWith('image')) continue
    const h = crypto.createHash('md5').update(r.buf).digest('hex')
    // dummyjson returns an identical "broken file" icon for missing images — remember its hash
    if (url.includes('ipad-pro') || url.includes('ipad-mini-2026')) {
      // known-broken probes from earlier generation; treat tiny icon-sized images separately below
    }
    if (!byHash.has(h)) byHash.set(h, { url, size: r.buf.length })
  }
  console.log('checked:', checked, 'unique images:', byHash.size)

  // classify into pools by path
  const pools = { phones: [], tablets: [], audio: [], chargers: [], cases: [], watches: [], accessories: [], other: [] }
  for (const { url } of byHash.values()) {
    const u = url.toLowerCase()
    if (u.includes('/smartphones/')) pools.phones.push(url)
    else if (u.includes('/tablets/') || u.includes('/laptops/')) pools.tablets.push(url)
    else if (u.includes('/mens-watches/') || u.includes('/womens-watches/')) pools.watches.push(url)
    else if (u.includes('/mobile-accessories/')) {
      if (/airpods|earbuds|buds|headphone|headset|echo|homepod|beat|speaker|soundcore/.test(u)) pools.audio.push(url)
      else if (/charger|cable|battery|power|charging|pack/.test(u)) pools.chargers.push(url)
      else if (/case|cover|protector/.test(u)) pools.cases.push(url)
      else if (/watch/.test(u)) pools.watches.push(url)
      else pools.accessories.push(url)
    } else pools.other.push(url)
  }

  // drop the shared "broken file" placeholder: it appears in MANY slugs with identical bytes;
  // it is the image whose url we probed from a slug we know is missing. Safer: detect by
  // checking the exact file of the known-missing slug ipad-pro
  const probeBroken = await get('https://cdn.dummyjson.com/product-images/tablets/ipad-pro/thumbnail.webp', true)
  if (probeBroken) {
    const bh = crypto.createHash('md5').update(probeBroken.buf).digest('hex')
    console.log('broken-doc hash detected:', byHash.get(bh)?.url ? 'present in pools — removing' : 'not present')
    for (const k of Object.keys(pools)) pools[k] = pools[k].filter((u) => {
      // re-hash each pool entry is expensive; instead compare size+known url marker
      return true
    })
    // direct removal: filter byHash first then rebuild? simpler: record bh and filter again below
    global.__bh = bh
  }

  // rebuild pools excluding broken hash
  const pools2 = { phones: [], tablets: [], audio: [], chargers: [], cases: [], watches: [], accessories: [] }
  for (const [h, { url }] of byHash) {
    if (global.__bh && h === global.__bh) continue
    const u = url.toLowerCase()
    if (u.includes('/smartphones/')) pools2.phones.push(url)
    else if (u.includes('/tablets/') || u.includes('/laptops/')) pools2.tablets.push(url)
    else if (u.includes('/mens-watches/') || u.includes('/womens-watches/')) pools2.watches.push(url)
    else if (u.includes('/mobile-accessories/')) {
      if (/airpods|earbuds|buds|headphone|headset|echo|homepod|beat|speaker|soundcore/.test(u)) pools2.audio.push(url)
      else if (/charger|cable|battery|power|charging|pack/.test(u)) pools2.chargers.push(url)
      else if (/case|cover|protector/.test(u)) pools2.cases.push(url)
      else if (/watch/.test(u)) pools2.watches.push(url)
      else pools2.accessories.push(url)
    }
  }
  for (const k of Object.keys(pools2)) console.log(k, pools2[k].length)
  require('fs').writeFileSync(__dirname + '/verified-images.json', JSON.stringify(pools2, null, 1))
  console.log('saved verified-images.json')
}

main().catch((e) => { console.error(e); process.exit(1) })
