// Generates ~220 realistic products across all categories (incl. tablets) as SQL seed files.
// Images: real product photos from the dummyjson CDN, pooled per category.
const fs = require('fs')
const path = require('path')
const https = require('https')

const CDN = 'https://cdn.dummyjson.com/product-images'

function fetchJson(p) {
  return new Promise((resolve, reject) => {
    https.get({ hostname: 'dummyjson.com', path: p, headers: { 'User-Agent': 'seed' } }, (res) => {
      let b = ''
      res.on('data', (c) => (b += c))
      res.on('end', () => resolve(JSON.parse(b)))
    }).on('error', reject)
  })
}

const esc = (s) => String(s).replace(/'/g, "''")
const slugify = (s) => 's2-' + s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
// Arabic-only names collapse to dashes — append category+index to guarantee uniqueness
const slugOf = (s, i) => {
  const base = slugify(s)
  const rest = base.slice(3) // strip 's2-' prefix before checking for latin letters
  return /[a-z]/.test(rest) ? base : base + '-' + i
}
const rot = (arr, i) => arr[i % arr.length]

async function main() {
  // ---- build image pools from dummyjson ----
  const pool = { phones: [], tablets: [], audio: [], chargers: [], cases: [], watches: [], accessories: [] }
  try {
    const [phones, tablets, acc, mw, ww] = await Promise.all([
      fetchJson('/products/category/smartphones?select=title,thumbnail&limit=0'),
      fetchJson('/products/category/tablets?select=title,thumbnail&limit=0'),
      fetchJson('/products/category/mobile-accessories?select=title,thumbnail&limit=0'),
      fetchJson('/products/category/mens-watches?select=title,thumbnail&limit=0'),
      fetchJson('/products/category/womens-watches?select=title,thumbnail&limit=0'),
    ])
    const push = (p, cat) => pool[cat].push(p.thumbnail)
    ;(phones.products || []).forEach((p) => push(p, 'phones'))
    ;(tablets.products || []).forEach((p) => push(p, 'tablets'))
    ;(acc.products || []).forEach((p) => {
      const t = p.title.toLowerCase()
      if (/airpods|earphone|buds|headphone|headset|echo|homepod|beat|speaker/.test(t)) push(p, 'audio')
      else if (/charger|cable|battery|power|charging|pack/.test(t)) push(p, 'chargers')
      else if (/case|cover|protector/.test(t)) push(p, 'cases')
      else if (/watch/.test(t)) push(p, 'watches')
      else push(p, 'accessories')
    })
    ;(mw.products || []).concat(ww.products || []).forEach((p) => push(p, 'watches'))
  } catch (e) {
    console.log('image fetch fallback:', e.message)
  }
  // guaranteed fallbacks
  if (!pool.phones.length) pool.phones = ['/smartphones/iphone-13-pro/thumbnail.webp', '/smartphones/iphone-x/thumbnail.webp', '/smartphones/samsung-galaxy-s10/thumbnail.webp'].map((u) => CDN + u)
  if (!pool.tablets.length) pool.tablets = ['/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp'].map((u) => CDN + u)
  if (!pool.audio.length) pool.audio = ['/mobile-accessories/apple-airpods/thumbnail.webp'].map((u) => CDN + u)
  if (!pool.chargers.length) pool.chargers = ['/mobile-accessories/apple-iphone-charger/thumbnail.webp'].map((u) => CDN + u)
  if (!pool.cases.length) pool.cases = ['/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp'].map((u) => CDN + u)
  if (!pool.watches.length) pool.watches = ['/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp'].map((u) => CDN + u)
  if (!pool.accessories.length) pool.accessories = ['/mobile-accessories/selfie-stick-monopod/thumbnail.webp'].map((u) => CDN + u)
  for (const k of Object.keys(pool)) console.log('pool', k, pool[k].length)

  // ============ DATA ============
  // [name, brand, screen, chip, ram, storage, camera, battery, net, price, old]
  const PHONES = [
    ['iPhone 15 128GB', 'Apple', '6.1" OLED', 'A16 Bionic', '6GB', '128GB', '48MP + 12MP', '3349mAh', '5G', 699, null],
    ['iPhone 15 Plus 128GB', 'Apple', '6.7" OLED', 'A16 Bionic', '6GB', '128GB', '48MP + 12MP', '4383mAh', '5G', 799, null],
    ['iPhone 15 Pro 128GB', 'Apple', '6.1" XDR 120Hz', 'A17 Pro', '8GB', '128GB', '48MP + 12MP + 12MP', '3274mAh', '5G', 899, 999],
    ['iPhone 15 Pro Max 256GB', 'Apple', '6.7" XDR 120Hz', 'A17 Pro', '8GB', '256GB', '48MP + 12MP + 12MP', '4441mAh', '5G', 1049, null],
    ['iPhone 14 128GB', 'Apple', '6.1" OLED', 'A15 Bionic', '6GB', '128GB', '12MP + 12MP', '3279mAh', '5G', 599, null],
    ['iPhone 13 128GB', 'Apple', '6.1" OLED', 'A15 Bionic', '4GB', '128GB', '12MP + 12MP', '3240mAh', '5G', 499, null],
    ['iPhone 16e 128GB', 'Apple', '6.1" OLED', 'A18', '8GB', '128GB', '48MP', '3561mAh', '5G', 599, null],
    ['iPhone SE 4 128GB', 'Apple', '6.1" OLED', 'A18', '8GB', '128GB', '48MP', '3700mAh', '5G', 429, null],
    ['Galaxy S24 Ultra 512GB', 'Samsung', '6.8" QHD+ 120Hz', 'Snapdragon 8 Gen 3', '12GB', '512GB', '200MP + 50MP + 12MP + 10MP', '5000mAh', '5G', 899, null],
    ['Galaxy S24 Plus 256GB', 'Samsung', '6.7" 120Hz', 'Exynos 2400', '12GB', '256GB', '50MP + 12MP + 10MP', '4900mAh', '5G', 749, null],
    ['Galaxy S24 256GB', 'Samsung', '6.2" 120Hz', 'Exynos 2400', '8GB', '256GB', '50MP + 12MP + 10MP', '4000mAh', '5G', 649, null],
    ['Galaxy S24 FE 256GB', 'Samsung', '6.7" 120Hz', 'Exynos 2400e', '8GB', '256GB', '50MP + 12MP + 8MP', '4700mAh', '5G', 549, null],
    ['Galaxy Z Fold6 512GB', 'Samsung', '7.6" + 6.3"', 'Snapdragon 8 Gen 3', '12GB', '512GB', '50MP + 12MP + 10MP', '4400mAh', '5G', 1499, null],
    ['Galaxy Z Flip6 256GB', 'Samsung', '6.7" 120Hz', 'Snapdragon 8 Gen 3', '12GB', '256GB', '50MP + 12MP', '4000mAh', '5G', 899, null],
    ['Galaxy A36 5G 256GB', 'Samsung', '6.7" 120Hz', 'Snapdragon 6 Gen 3', '8GB', '256GB', '50MP + 8MP + 5MP', '5000mAh', '5G', 349, null],
    ['Galaxy A26 5G 128GB', 'Samsung', '6.7" 120Hz', 'Exynos 1380', '6GB', '128GB', '50MP + 8MP + 2MP', '5000mAh', '5G', 249, null],
    ['Galaxy A16 128GB', 'Samsung', '6.7" 90Hz', 'Exynos 1330', '4GB', '128GB', '50MP + 5MP + 2MP', '5000mAh', '4G', 179, null],
    ['Galaxy C55 256GB', 'Samsung', '6.7" 120Hz', 'Snapdragon 7 Gen 1', '8GB', '256GB', '50MP + 8MP + 2MP', '5000mAh', '5G', 229, null],
    ['Xiaomi 15 512GB', 'Xiaomi', '6.36" 120Hz', 'Snapdragon 8 Elite', '12GB', '512GB', '50MP Leica + 50MP + 50MP', '5240mAh', '5G', 749, null],
    ['Xiaomi 15 Pro 512GB', 'Xiaomi', '6.73" 120Hz', 'Snapdragon 8 Elite', '12GB', '512GB', '50MP Leica + 50MP + 50MP', '6100mAh', '5G', 899, null],
    ['Xiaomi 14 256GB', 'Xiaomi', '6.36" 120Hz', 'Snapdragon 8 Gen 3', '12GB', '256GB', '50MP Leica + 50MP + 50MP', '4610mAh', '5G', 599, null],
    ['Xiaomi 13T Pro 512GB', 'Xiaomi', '6.67" 144Hz', 'Dimensity 9200+', '12GB', '512GB', '50MP Leica + 50MP + 12MP', '5000mAh', '5G', 549, null],
    ['Xiaomi 13T 256GB', 'Xiaomi', '6.67" 144Hz', 'Dimensity 8200', '8GB', '256GB', '50MP Leica + 50MP + 12MP', '5000mAh', '5G', 449, null],
    ['POCO F6 512GB', 'Xiaomi', '6.67" 120Hz', 'Snapdragon 8s Gen 3', '12GB', '512GB', '50MP + 8MP', '5000mAh', '5G', 349, null],
    ['POCO X7 Pro 512GB', 'Xiaomi', '6.67" 120Hz', 'Dimensity 8400', '8GB', '512GB', '50MP + 8MP', '6000mAh', '5G', 299, null],
    ['POCO M7 Pro 256GB', 'Xiaomi', '6.67" 120Hz', 'Dimensity 7025', '8GB', '256GB', '50MP + 2MP', '5110mAh', '4G', 199, null],
    ['Redmi 14C 256GB', 'Xiaomi', '6.88" 120Hz', 'Helio G81', '8GB', '256GB', '50MP + 2MP', '5160mAh', '4G', 129, null],
    ['Redmi Note 13 256GB', 'Xiaomi', '6.67" 120Hz', 'Snapdragon 685', '8GB', '256GB', '108MP + 8MP + 2MP', '5000mAh', '4G', 179, null],
    ['Realme GT 6 512GB', 'Realme', '6.78" 120Hz', 'Snapdragon 8s Gen 3', '12GB', '512GB', '50MP Sony + 8MP + 2MP', '5500mAh', '5G', 499, null],
    ['Realme 13 Pro+ 512GB', 'Realme', '6.7" 120Hz', 'Snapdragon 7s Gen 2', '12GB', '512GB', '50MP Sony + 8MP + 32MP', '5200mAh', '5G', 379, null],
    ['Realme C75 256GB', 'Realme', '6.72" 90Hz', 'Helio G92', '8GB', '256GB', '50MP + 2MP', '5828mAh', '4G', 149, null],
    ['Realme Note 60 128GB', 'Realme', '6.74" 90Hz', 'Unisoc T612', '4GB', '128GB', '50MP', '5000mAh', '4G', 119, null],
    ['Realme C63 256GB', 'Realme', '6.74" 90Hz', 'Unisoc T612', '8GB', '256GB', '50MP + 2MP', '5000mAh', '4G', 139, null],
    ['Realme Narzo 70 128GB', 'Realme', '6.67" 120Hz', 'Dimensity 7050', '8GB', '128GB', '50MP + 2MP', '5000mAh', '5G', 159, null],
    ['Oppo Find X8 512GB', 'Oppo', '6.59" 120Hz', 'Dimensity 9400', '12GB', '512GB', '50MP + 50MP + 50MP', '5630mAh', '5G', 749, null],
    ['Oppo Reno13 5G 256GB', 'Oppo', '6.59" 120Hz', 'Dimensity 8350', '8GB', '256GB', '50MP + 8MP', '5600mAh', '5G', 399, null],
    ['Oppo Reno13 Pro 512GB', 'Oppo', '6.83" 120Hz', 'Dimensity 8350', '12GB', '512GB', '50MP + 8MP + 50MP', '5800mAh', '5G', 549, null],
    ['Oppo A5 Pro 256GB', 'Oppo', '6.67" 120Hz', 'Dimensity 6300', '8GB', '256GB', '50MP + 2MP', '5800mAh', '5G', 249, null],
    ['Oppo A60 256GB', 'Oppo', '6.67" 90Hz', 'Snapdragon 680', '8GB', '256GB', '50MP + 2MP', '5000mAh', '4G', 169, null],
    ['Vivo X200 512GB', 'Vivo', '6.67" 120Hz', 'Dimensity 9400', '12GB', '512GB', '50MP Zeiss + 50MP + 50MP', '5800mAh', '5G', 699, null],
    ['Vivo V50 256GB', 'Vivo', '6.77" 120Hz', 'Snapdragon 7 Gen 3', '8GB', '256GB', '50MP Zeiss + 50MP', '6000mAh', '5G', 399, null],
    ['Vivo V40 256GB', 'Vivo', '6.78" 120Hz', 'Snapdragon 7 Gen 3', '8GB', '256GB', '50MP Zeiss + 50MP', '5500mAh', '5G', 349, null],
    ['Vivo Y200 256GB', 'Vivo', '6.67" 120Hz', 'Snapdragon 4 Gen 2', '8GB', '256GB', '64MP + 2MP', '4800mAh', '5G', 249, null],
    ['Vivo Y28 128GB', 'Vivo', '6.68" 90Hz', 'Helio G85', '6GB', '128GB', '50MP + 2MP', '6000mAh', '4G', 139, null],
    ['Honor Magic7 Lite 256GB', 'Honor', '6.78" 120Hz', 'Snapdragon 6 Gen 1', '8GB', '256GB', '108MP + 5MP', '6600mAh', '5G', 349, null],
    ['Honor 200 256GB', 'Honor', '6.7" 120Hz', 'Snapdragon 7 Gen 3', '8GB', '256GB', '50MP + 12MP + 50MP', '5200mAh', '5G', 399, null],
    ['Honor 200 Pro 512GB', 'Honor', '6.78" 120Hz', 'Snapdragon 8s Gen 3', '12GB', '512GB', '50MP + 12MP + 50MP', '5200mAh', '5G', 549, null],
    ['Honor X9c 256GB', 'Honor', '6.78" 120Hz', 'Snapdragon 6 Gen 1', '8GB', '256GB', '108MP + 5MP', '6600mAh', '5G', 299, null],
    ['Honor X8c 256GB', 'Honor', '6.78" 120Hz', 'Snapdragon 685', '8GB', '256GB', '108MP + 2MP', '6600mAh', '4G', 199, null],
    ['Huawei nova 13 256GB', 'Huawei', '6.7" 120Hz', 'Kirin 8000', '8GB', '256GB', '50MP + 8MP', '5000mAh', '4G', 399, null],
    ['Huawei nova 13i 256GB', 'Huawei', '6.7" 90Hz', 'Snapdragon 680', '8GB', '256GB', '50MP + 2MP', '5000mAh', '4G', 229, null],
    ['Huawei nova Y70 128GB', 'Huawei', '6.75" 90Hz', 'Kirin 710', '4GB', '128GB', '50MP + 2MP', '6000mAh', '4G', 159, null],
    ['Tecno Camon 30 256GB', 'Tecno', '6.78" 120Hz', 'Helio G99', '8GB', '256GB', '50MP + 2MP', '5000mAh', '4G', 219, null],
    ['Tecno Spark 30 128GB', 'Tecno', '6.78" 120Hz', 'Helio G91', '6GB', '128GB', '48MP + 2MP', '5000mAh', '4G', 139, null],
    ['Tecno Pova 6 Pro 256GB', 'Tecno', '6.78" 120Hz', 'Dimensity 6080', '8GB', '256GB', '108MP + 2MP', '6000mAh', '5G', 199, null],
    ['Infinix Note 40 Pro 256GB', 'Infinix', '6.78" 120Hz', 'Helio G99', '8GB', '256GB', '108MP + 2MP', '5000mAh', '4G', 199, null],
    ['Infinix Hot 50 128GB', 'Infinix', '6.7" 120Hz', 'Helio G100', '8GB', '128GB', '50MP + 2MP', '5000mAh', '4G', 119, null],
    ['Infinix GT 20 Pro 256GB', 'Infinix', '6.78" 144Hz', 'Dimensity 8200', '12GB', '256GB', '108MP + 2MP', '5000mAh', '5G', 249, null],
    ['Infinix Zero 40 512GB', 'Infinix', '6.78" 144Hz', 'Helio G100', '12GB', '512GB', '108MP + 2MP', '5000mAh', '5G', 299, null],
    ['Motorola Edge 50 256GB', 'Motorola', '6.7" 120Hz', 'Snapdragon 7 Gen 1', '8GB', '256GB', '50MP + 13MP + 10MP', '5000mAh', '5G', 349, null],
    ['Motorola G85 256GB', 'Motorola', '6.67" 120Hz', 'Snapdragon 6s Gen 3', '8GB', '256GB', '50MP + 2MP', '5000mAh', '4G', 229, null],
    ['Motorola Razr 50 256GB', 'Motorola', '6.9" 165Hz', 'Dimensity 7300', '8GB', '256GB', '50MP + 13MP', '4200mAh', '5G', 699, null],
    ['Google Pixel 9 256GB', 'Google', '6.3" 120Hz', 'Tensor G4', '12GB', '256GB', '50MP + 48MP', '4700mAh', '5G', 799, null],
    ['Google Pixel 9 Pro 256GB', 'Google', '6.3" 120Hz', 'Tensor G4', '16GB', '256GB', '50MP + 48MP + 48MP', '4700mAh', '5G', 999, null],
    ['Google Pixel 8a 128GB', 'Google', '6.1" 120Hz', 'Tensor G3', '8GB', '128GB', '64MP + 13MP', '4492mAh', '5G', 449, null],
    ['OnePlus 13 512GB', 'OnePlus', '6.82" 120Hz', 'Snapdragon 8 Elite', '12GB', '512GB', '50MP Hasselblad + 50MP + 50MP', '6000mAh', '5G', 849, null],
    ['OnePlus 13R 256GB', 'OnePlus', '6.78" 120Hz', 'Snapdragon 8 Gen 3', '12GB', '256GB', '50MP + 50MP + 8MP', '6000mAh', '5G', 549, null],
    ['OnePlus Nord 4 512GB', 'OnePlus', '6.74" 120Hz', 'Snapdragon 7+ Gen 3', '12GB', '512GB', '50MP + 8MP', '5500mAh', '5G', 449, null],
    ['Nothing Phone 2a 256GB', 'Nothing', '6.7" 120Hz', 'Dimensity 7200', '8GB', '256GB', '50MP + 50MP', '5000mAh', '5G', 329, null],
    ['Nothing Phone 3a 256GB', 'Nothing', '6.77" 120Hz', 'Snapdragon 7s Gen 3', '8GB', '256GB', '50MP + 50MP + 8MP', '5000mAh', '5G', 379, null],
    ['CMF Phone 1 256GB', 'Nothing', '6.67" 120Hz', 'Dimensity 7300', '8GB', '256GB', '50MP + 2MP', '5000mAh', '5G', 199, null],
    ['Sony Xperia 10 VI 128GB', 'Sony', '6.1" OLED', 'Snapdragon 6 Gen 1', '8GB', '128GB', '50MP + 8MP', '5000mAh', '5G', 399, null],
    ['ASUS Zenfone 11 Ultra 512GB', 'ASUS', '6.78" 144Hz', 'Snapdragon 8 Gen 3', '16GB', '512GB', '50MP + 13MP + 32MP', '5500mAh', '5G', 899, null],
  ]

  // [name, brand, screen, chip, storage, battery, net, price, old]
  const TABLETS = [
    ['iPad 11 (A16) 128GB', 'Apple', '11" Liquid Retina', 'A16', '128GB', 'حتى 10 ساعات', 'Wi-Fi', 329, null],
    ['iPad Air 11 M2 128GB', 'Apple', '11" Liquid Retina', 'M2', '128GB', 'حتى 10 ساعات', 'Wi-Fi', 549, null],
    ['iPad Air 13 M2 128GB', 'Apple', '13" Liquid Retina', 'M2', '128GB', 'حتى 10 ساعات', 'Wi-Fi', 699, null],
    ['iPad Pro 11 M4 256GB', 'Apple', '11" Ultra Retina XDR', 'M4', '256GB', 'حتى 10 ساعات', 'Wi-Fi', 899, null],
    ['iPad Pro 13 M4 256GB', 'Apple', '13" Ultra Retina XDR', 'M4', '256GB', 'حتى 10 ساعات', 'Wi-Fi', 1149, null],
    ['iPad mini 7 128GB', 'Apple', '8.3" Liquid Retina', 'A17 Pro', '128GB', 'حتى 10 ساعات', 'Wi-Fi', 449, null],
    ['iPad 10 64GB', 'Apple', '10.9" Liquid Retina', 'A14 Bionic', '64GB', 'حتى 10 ساعات', 'Wi-Fi', 279, null],
    ['Galaxy Tab S10 Ultra 512GB', 'Samsung', '14.6" AMOLED 120Hz', 'Dimensity 9300+', '512GB', '11200mAh', 'Wi-Fi', 1099, null],
    ['Galaxy Tab S10+ 512GB', 'Samsung', '12.4" AMOLED 120Hz', 'Dimensity 9300+', '512GB', '10090mAh', 'Wi-Fi', 899, null],
    ['Galaxy Tab S9 FE 128GB', 'Samsung', '10.9" 90Hz', 'Exynos 1380', '128GB', '8000mAh', 'Wi-Fi', 399, null],
    ['Galaxy Tab S9 FE+ 256GB', 'Samsung', '12.4" 90Hz', 'Exynos 1380', '256GB', '10090mAh', 'Wi-Fi', 499, null],
    ['Galaxy Tab A9+ 128GB', 'Samsung', '11" 90Hz', 'Snapdragon 695', '128GB', '7040mAh', 'Wi-Fi', 189, null],
    ['Galaxy Tab A9 64GB', 'Samsung', '8.7" 60Hz', 'Helio G99', '64GB', '5100mAh', 'Wi-Fi', 139, null],
    ['Galaxy Tab S6 Lite 2024 128GB', 'Samsung', '10.4" 60Hz', 'Exynos 1280', '128GB', '7040mAh', 'Wi-Fi', 249, null],
    ['Xiaomi Pad 6 256GB', 'Xiaomi', '11" 144Hz', 'Snapdragon 870', '256GB', '8840mAh', 'Wi-Fi', 299, null],
    ['Xiaomi Pad 6S Pro 512GB', 'Xiaomi', '12.4" 144Hz', 'Snapdragon 8 Gen 2', '512GB', '10000mAh', 'Wi-Fi', 549, null],
    ['Redmi Pad Pro 256GB', 'Xiaomi', '12.1" 120Hz', 'Snapdragon 7s Gen 2', '256GB', '12000mAh', 'Wi-Fi', 249, null],
    ['Redmi Pad SE 128GB', 'Xiaomi', '11" 90Hz', 'Helio G99', '128GB', '8000mAh', 'Wi-Fi', 149, null],
    ['Honor Pad 9 256GB', 'Honor', '12.1" 120Hz', 'Snapdragon 6 Gen 1', '256GB', '8300mAh', 'Wi-Fi', 229, null],
    ['Honor MagicPad 2 512GB', 'Honor', '13.2" 144Hz', 'Snapdragon 8s Gen 3', '512GB', '10700mAh', 'Wi-Fi', 499, null],
    ['Lenovo Tab P12 256GB', 'Lenovo', '12.7" 120Hz', 'Dimensity 7050', '256GB', '10200mAh', 'Wi-Fi', 279, null],
    ['Lenovo Tab M11 128GB', 'Lenovo', '11" 90Hz', 'Helio G88', '128GB', '7040mAh', 'Wi-Fi', 159, null],
    ['Huawei MatePad 11.5S 256GB', 'Huawei', '11.5" 144Hz', 'Kirin 830', '256GB', '8800mAh', 'Wi-Fi', 249, null],
    ['Huawei MatePad SE 128GB', 'Huawei', '10.4" 60Hz', 'Kirin 710', '128GB', '5100mAh', 'Wi-Fi', 139, null],
  ]

  // [name, brand, net, price, old]
  const USED = [
    ['iPhone 16 Pro 128GB', 'Apple', '5G', 899, null],
    ['iPhone 16 128GB', 'Apple', '5G', 649, null],
    ['iPhone 15 Plus 128GB', 'Apple', '5G', 549, null],
    ['iPhone 14 Plus 128GB', 'Apple', '5G', 469, null],
    ['iPhone 13 mini 128GB', 'Apple', '5G', 329, null],
    ['iPhone 12 Pro 128GB', 'Apple', '5G', 329, null],
    ['iPhone 12 mini 128GB', 'Apple', '5G', 269, null],
    ['iPhone 11 64GB', 'Apple', '4G', 219, null],
    ['iPhone XR 64GB', 'Apple', '4G', 159, null],
    ['iPhone SE 2020 64GB', 'Apple', '4G', 119, null],
    ['Galaxy S24 256GB', 'Samsung', '5G', 499, null],
    ['Galaxy S23 256GB', 'Samsung', '5G', 389, null],
    ['Galaxy S22 Ultra 256GB', 'Samsung', '5G', 449, null],
    ['Galaxy S21 128GB', 'Samsung', '5G', 249, null],
    ['Galaxy S20 128GB', 'Samsung', '5G', 189, null],
    ['Galaxy Note 20 Ultra 256GB', 'Samsung', '5G', 329, null],
    ['Galaxy A54 128GB', 'Samsung', '5G', 199, null],
    ['Galaxy A53 128GB', 'Samsung', '5G', 149, null],
    ['Galaxy Z Flip4 128GB', 'Samsung', '5G', 469, null],
    ['Galaxy Z Fold4 256GB', 'Samsung', '5G', 749, null],
    ['Xiaomi 13 256GB', 'Xiaomi', '5G', 329, null],
    ['Xiaomi 12T Pro 256GB', 'Xiaomi', '5G', 259, null],
    ['Xiaomi 11T 128GB', 'Xiaomi', '5G', 169, null],
    ['POCO F5 256GB', 'Xiaomi', '5G', 199, null],
    ['POCO X5 Pro 256GB', 'Xiaomi', '5G', 169, null],
    ['Redmi Note 12 Pro 256GB', 'Xiaomi', '5G', 139, null],
    ['Realme GT Neo 3 128GB', 'Realme', '5G', 179, null],
    ['Realme 10 Pro+ 128GB', 'Realme', '5G', 159, null],
    ['Realme C55 128GB', 'Realme', '4G', 109, null],
    ['Oppo Reno10 256GB', 'Oppo', '5G', 189, null],
    ['Oppo Reno8 Pro 256GB', 'Oppo', '5G', 229, null],
    ['Oppo Find X5 256GB', 'Oppo', '5G', 249, null],
    ['Vivo V29 256GB', 'Vivo', '5G', 209, null],
    ['Vivo V25 256GB', 'Vivo', '5G', 159, null],
    ['Vivo X80 256GB', 'Vivo', '5G', 269, null],
    ['Honor 90 256GB', 'Honor', '5G', 179, null],
    ['Honor 70 128GB', 'Honor', '5G', 149, null],
    ['Honor Magic4 Pro 256GB', 'Honor', '5G', 289, null],
    ['Huawei P30 Pro 128GB', 'Huawei', '4G', 199, null],
    ['Huawei P40 Pro 256GB', 'Huawei', '5G', 249, null],
    ['Huawei Mate 40 Pro 256GB', 'Huawei', '5G', 329, null],
    ['OnePlus 11 256GB', 'OnePlus', '5G', 329, null],
    ['OnePlus 10 Pro 256GB', 'OnePlus', '5G', 279, null],
    ['OnePlus Nord 2T 128GB', 'OnePlus', '5G', 159, null],
    ['Google Pixel 7 128GB', 'Google', '5G', 289, null],
    ['Google Pixel 6 128GB', 'Google', '5G', 199, null],
    ['iPad Air 4 64GB', 'Apple', 'Wi-Fi', 279, null],
    ['iPad 9 64GB', 'Apple', 'Wi-Fi', 199, null],
    ['Galaxy Tab S8 128GB', 'Samsung', 'Wi-Fi', 349, null],
    ['Galaxy Tab S7 FE 64GB', 'Samsung', 'Wi-Fi', 219, null],
    ['Xiaomi Pad 5 128GB', 'Xiaomi', 'Wi-Fi', 179, null],
    ['Apple Watch Ultra 49mm', 'Apple', '4G', 449, null],
    ['Galaxy Watch4 Classic', 'Samsung', '4G', 99, null],
  ]

  // [name, brand, price, old?]
  const AUDIO = [
    ['سماعة Apple AirPods 4 مع ANC', 'Apple', 149, null],
    ['سماعة AirPods Max USB-C', 'Apple', 529, null],
    ['سماعة Samsung Galaxy Buds3 Pro', 'Samsung', 189, null],
    ['سماعة Samsung Galaxy Buds3', 'Samsung', 149, null],
    ['سماعة Samsung Galaxy Buds FE', 'Samsung', 79, null],
    ['سماعة Sony WH-CH720N لاسلكية', 'Sony', 129, null],
    ['سماعة Sony WF-C700N', 'Sony', 89, null],
    ['سماعة JBL Tune 720BT', 'JBL', 59, null],
    ['سماعة JBL Wave Beam', 'JBL', 39, null],
    ['سماعة Anker Soundcore Life Q30', 'Anker', 79, null],
    ['سماعة Soundcore Liberty 4 NC', 'Anker', 89, null],
    ['سماعة Xiaomi Redmi Buds 6', 'Xiaomi', 29, null],
    ['سماعة realme Buds T300', 'Realme', 29, null],
    ['سماعة OnePlus Nord Buds 2r', 'OnePlus', 29, null],
    ['سماعة Honor Earbuds X5', 'Honor', 25, null],
    ['مكبر صوت JBL Flip 6', 'JBL', 99, null],
    ['مكبر صوت Anker Soundcore Motion Boom', 'Anker', 89, null],
    ['مكبر صوت JBL Go 4', 'JBL', 39, null],
  ]
  const CHARGERS = [
    ['شاحن Anker Nano 30W GaN', 'Anker', 19, null],
    ['شاحن Baseus GaN5 65W', 'Baseus', 25, null],
    ['شاحن Ugreen 100W GaN', 'Ugreen', 39, null],
    ['شاحن Samsung أصلي 25W', 'Samsung', 13, null],
    ['شاحن Xiaomi 33W', 'Xiaomi', 11, null],
    ['شاحن Huawei SuperCharge 66W', 'Huawei', 19, null],
    ['شاحن سيارة Anker 45W', 'Anker', 12, null],
    ['قاعدة شحن MagSafe', 'Apple', 35, null],
    ['كابل Anker USB-C 100W 1م', 'Anker', 12, null],
    ['كابل Apple Lightning أصلي 1م', 'Apple', 10, null],
    ['كابل مقوى نايلون 2م', 'Baseus', 7, null],
    ['حامل شحن لاسلكي للسيارة', 'Baseus', 22, null],
    ['باور بانك Anker 20000mAh', 'Anker', 39, null],
    ['باور بانك Baseus 10000mAh', 'Baseus', 19, null],
    ['باور بانك مغناطيسي 5000mAh', 'Anker', 29, null],
  ]
  const CASES = [
    ['كفر شفاف iPhone 16 Pro Max', 'Mobily Bro', 9, null],
    ['كفر سيليكون iPhone 15', 'Apple', 12, null],
    ['كفر Galaxy S25 Ultra مقاوم للصدمات', 'Mobily Bro', 12, null],
    ['كفر Galaxy A56', 'Mobily Bro', 8, null],
    ['كفر Redmi Note 14', 'Mobily Bro', 7, null],
    ['كفر محفظة جلد iPhone 16', 'Apple', 19, null],
    ['زجاج 9H لـ iPhone 16', 'Mobily Bro', 6, null],
    ['زجاج 9H لـ Galaxy S25', 'Mobily Bro', 6, null],
    ['حماية عدسة الكاميرا', 'Mobily Bro', 4, null],
    ['حافظة جيب جلدية', 'Mobily Bro', 9, null],
    ['سوار Apple Watch رياضي', 'Apple', 8, null],
    ['حامل تابلت للسرير', 'Mobily Bro', 14, null],
  ]
  const WATCHES = [
    ['Apple Watch SE 3 GPS 40mm', 'Apple', 229, null],
    ['Apple Watch Ultra 2 49mm', 'Apple', 749, null],
    ['Galaxy Watch7 44mm', 'Samsung', 299, null],
    ['Galaxy Watch FE 40mm', 'Samsung', 179, null],
    ['Xiaomi Watch S4', 'Xiaomi', 119, null],
    ['Redmi Watch 5', 'Xiaomi', 49, null],
    ['Huawei Watch GT 5 46mm', 'Huawei', 229, null],
    ['Amazfit GTR 4', 'Amazfit', 179, null],
    ['Amazfit Bip 5', 'Amazfit', 69, null],
    ['Honor Band 9', 'Honor', 35, null],
  ]
  const ACCESSORIES = [
    ['حامل موبايل مغناطيسي للسيارة', 'Baseus', 11, null],
    ['عصا سيلفي ثلاثية القوائم', 'Mobily Bro', 12, null],
    ['إضاءة حلقة 10 بوصة', 'Mobily Bro', 14, null],
    ['حامل حلقة للجوال', 'Mobily Bro', 6, null],
    ['مفتاح OTG Type-C', 'Mobily Bro', 5, null],
    ['قلم Stylus عالمي للموبايل والتابلت', 'Baseus', 12, null],
    ['سلسلة هاتف قماشية', 'Mobily Bro', 8, null],
    ['حافظة بطاقات خلف الهاتف', 'Mobily Bro', 7, null],
    ['منظف شاشات وعدسات', 'Mobily Bro', 4, null],
    ['فرشاة تنظيف منافذ الشحن', 'Mobily Bro', 3, null],
    ['محول بطاقات SD عبر Type-C', 'Ugreen', 9, null],
    ['عدسة تصوير ماكرو للجوال', 'Baseus', 15, null],
  ]

  // ============ SQL generation ============
  const total = PHONES.length + TABLETS.length + USED.length + AUDIO.length + CHARGERS.length + CASES.length + WATCHES.length + ACCESSORIES.length
  console.log('new products total:', total)

  const chunks = { 1: [], 2: [], 3: [] }
  const usedSpecsTemplates = {
    Apple: ['A17 Pro', 'A16 Bionic', 'A15 Bionic', 'A14 Bionic'],
    Samsung: ['Snapdragon 8 Gen 2', 'Exynos 2200', 'Snapdragon 888', 'Exynos 2100'],
    Xiaomi: ['Snapdragon 8+ Gen 1', 'Dimensity 8200', 'Snapdragon 870', 'Snapdragon 888'],
    Realme: ['Dimensity 1080', 'Snapdragon 778G', 'Helio G99'],
    Oppo: ['Dimensity 8100', 'Snapdragon 778G', 'Dimensity 1300'],
    Vivo: ['Dimensity 8200', 'Snapdragon 870', 'Dimensity 1300'],
    Honor: ['Snapdragon 8 Gen 1', 'Snapdragon 778G', 'Dimensity 9000'],
    Huawei: ['Kirin 9000', 'Kirin 990', 'Snapdragon 888'],
    OnePlus: ['Snapdragon 8 Gen 2', 'Snapdragon 8+ Gen 1', 'Dimensity 1300'],
    Google: ['Tensor G2', 'Tensor G1'],
  }
  const screens = ['6.1" OLED', '6.7" AMOLED 120Hz', '6.4" AMOLED', '6.67" AMOLED', '6.78" AMOLED 120Hz', '6.36" OLED']
  const rams = ['8GB', '12GB', '6GB', '8GB']
  const storages = ['128GB', '256GB', '512GB', '128GB']
  const cameras = ['50MP + 12MP', '108MP + 8MP + 2MP', '48MP + 12MP', '50MP + 50MP', '64MP + 8MP']
  const batteries = ['5000mAh', '4500mAh', '4800mAh', '5200mAh', '4600mAh']
  const overall = ['ممتازة', 'جيدة جدًا', 'جيدة', 'ممتازة', 'جيدة جدًا', 'ممتازة']
  const batts = [95, 93, 91, 89, 87, 85, 83, 80]
  const screenConds = ['ممتازة', 'جيدة جدًا', 'آثار استخدام']
  const bodyConds = ['ممتاز', 'آثار استخدام بسيطة', 'خدوش بسيطة']
  const ports = ['USB-C سليم', 'Lightning سليم']
  const accSets = ['الجهاز فقط', 'الجهاز + كابل شحن', 'الجهاز + الشاحن', 'الجهاز + الشاحن الأصلي + الكابل']
  const warranties = ['ضمان متجر شهر', 'ضمان متجر أسبوعين', 'بدون ضمان']
  const usages = ['أقل من سنة', 'سنة', 'سنة ونصف', 'سنتان', 'سنتان ونصف', '3 سنوات']
  const colorsSets = ['أسود', 'أبيض', 'أسود، فضي', 'أزرق', 'رمادي', 'ذهبي']

  const phoneDesc = (n) =>
    rot([
      `${n[0]} — جديد بكرتونته الأصلية وضمان المتجر. شاشة ${n[2]}، معالج ${n[3]}، ذاكرة ${n[4]}/${n[5]}، كاميرا ${n[6]} وبطارية ${n[7]}.`,
      `${n[0]} — الأداء والأناقة في جهاز واحد. شاشة ${n[2]}، معالج ${n[3]}، ذاكرة ${n[4]}/${n[5]} وكاميرا ${n[6]} بجودة استثنائية.`,
      `${n[0]} — متوفر الآن بأفضل سعر في المتجر. مواصفات: شاشة ${n[2]}، معالج ${n[3]}، ${n[4]} رام / ${n[5]} تخزين، بطارية ${n[7]} متينة تدوم طويلاً.`,
    ], PHONES.indexOf(n))

  let idx = 0

  // --- chunk 1: category + new phones ---
  const phonesRows = PHONES.map((n, i) => {
    const img = rot(pool.phones, i)
    const specs = { screen: n[2], processor: n[3], ram: n[4], storage: n[5], camera: n[6], battery: n[7], os: n[1] === 'Apple' ? 'iOS' : 'Android', colors: rot(colorsSets, i) }
    return `('${slugify(n[0])}', '${esc(n[0])}', '${esc(n[1])}', (select id from cat), 'new', '${n[8]}', ${n[9]}, ${n[10] === null ? 'null' : n[10]}, ${rot([6, 8, 10, 12, 15, 20], i)}, '${esc(phoneDesc(n))}', '${esc(JSON.stringify(specs))}', '${img}')`
  }).join(',\n')
  chunks[1].push(`
with cat as (select id from public.categories where slug='smartphones')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, main_image) values
${phonesRows}
on conflict (slug) do nothing;`)

  // --- chunk 2: tablets + used ---
  const tabletRows = TABLETS.map((t, i) => {
    const os = t[1] === 'Apple' ? 'iPadOS 18' : 'Android 15'
    const specs = { screen: t[2], processor: t[3], storage: t[4], battery: t[5], os }
    const desc = `${t[0]} — تابلت جديد مثالي للعمل والدراسة والترفيه. شاشة ${t[2]}، معالج ${t[3]}، تخزين ${t[4]} وبطارية ${t[5]}.`
    return `('${slugify(t[0])}', '${esc(t[0])}', '${esc(t[1])}', (select id from cat), 'new', '${t[6]}', ${t[7]}, ${t[8] === null ? 'null' : t[8]}, ${rot([4, 6, 8, 10], i)}, '${esc(desc)}', '${esc(JSON.stringify(specs))}', '${rot(pool.tablets, i)}')`
  }).join(',\n')
  chunks[2].push(`
with cat as (select id from public.categories where slug='tablets')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, main_image) values
${tabletRows}
on conflict (slug) do nothing;`)

  const usedRows = USED.map((u, i) => {
    const brand = u[1]
    const isTablet = /iPad|Tab|Pad/.test(u[0])
    const specs = isTablet
      ? { screen: rot(['11" LCD 90Hz', '10.9" LCD', '11" AMOLED 120Hz', '12.4" 120Hz'], i), processor: rot(usedSpecsTemplates[brand] || ['ثماني النواة'], i), storage: rot(['64GB', '128GB', '256GB'], i), os: brand === 'Apple' ? 'iPadOS' : 'Android 14' }
      : { screen: rot(screens, i), processor: rot(usedSpecsTemplates[brand] || ['ثماني النواة'], i), ram: rot(rams, i), storage: rot(storages, i), camera: rot(cameras, i), battery: rot(batteries, i), os: brand === 'Apple' ? 'iOS 18' : 'Android 14', colors: rot(colorsSets, i) }
    const isWatch = /Watch/.test(u[0])
    const ud = isWatch
      ? { overall_condition: rot(overall, i), battery_health: rot(batts, i), screen_condition: rot(screenConds, i), body_condition: rot(bodyConds, i), charging: 'يعمل بشكل سليم', accessories: rot(accSets, i), warranty: rot(warranties, i), usage_duration: rot(usages, i) }
      : { overall_condition: rot(overall, i), battery_health: rot(batts, i), screen_condition: rot(screenConds, i), body_condition: rot(bodyConds, i), cameras: 'تعمل بشكل سليم', face_id: 'تعمل', speakers: 'تعمل بشكل سليم', charging: 'يعمل بشكل سليم', port: rot(ports, i), accessories: rot(accSets, i), warranty: rot(warranties, i), usage_duration: rot(usages, i), notes: 'الجهاز مفحوص بالكامل من فريق Mobily Bro' }
    const desc = `${u[0]} — مستعمل مفحوص بالكامل من فريق المتجر بحالة ${rot(overall, i)} وصحة بطارية ${rot(batts, i)}% — بأسعار أوفر بكثير من الجديد.`
    const pool_ = isWatch ? pool.watches : /iPad|Tab|Pad/.test(u[0]) ? pool.tablets : pool.phones
    return `('${slugify('used-' + u[0])}', '${esc(u[0] + ' — مستعمل')}', '${esc(brand)}', (select id from cat), 'used', '${u[2]}', ${u[3]}, ${u[4] === null ? 'null' : u[4]}, ${rot([1, 1, 2, 1], i)}, '${esc(desc)}', '${esc(JSON.stringify(specs))}', '${esc(JSON.stringify(ud))}', '${rot(pool_, i)}')`
  }).join(',\n')
  chunks[2].push(`
with cat as (select id from public.categories where slug='used')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, used_details, main_image) values
${usedRows}
on conflict (slug) do nothing;`)

  // --- chunk 3: audio, chargers, cases, watches, accessories ---
  const group = (list, catSlug, poolKey, descFn, specsFn) => {
    if (!list.length) return ''
    const rows = list.map((a, i) => {
      const img = rot(pool[poolKey], i)
      return `('${slugOf(a[0], catSlug + '-' + i)}', '${esc(a[0])}', '${esc(a[1])}', (select id from cat), 'new', '4G', ${a[2]}, ${a[3] === undefined || a[3] === null ? 'null' : a[3]}, ${rot([10, 15, 20, 25, 30], i)}, '${esc(descFn(a))}', '${esc(JSON.stringify(specsFn(a, i)))}', '${img}')`
    }).join(',\n')
    return `
with cat as (select id from public.categories where slug='${catSlug}')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, main_image) values
${rows}
on conflict (slug) do nothing;`
  }

  chunks[3].push(group(AUDIO, 'audio', 'audio', (a) => `${a[0]} — صوت نقي وتصميم مريح، أصلية 100% بضمان المتجر.`, (a, i) => ({ battery: rot(['حتى 30 ساعة', 'حتى 24 ساعة', 'حتى 12 ساعة', 'حتى 40 ساعة'], i), colors: rot(['أبيض', 'أسود', 'رمادي'], i) })))
  chunks[3].push(group(CHARGERS, 'chargers', 'chargers', (a) => `${a[0]} — شحن سريع وآمن بجودة أصلية وضمان المتجر.`, (a, i) => ({ colors: rot(['أبيض', 'أسود'], i) })))
  chunks[3].push(group(CASES, 'cases', 'cases', (a) => `${a[0]} — حماية أنيقة تناسب جهازك بشكل مثالي وتحافظ عليه من الخدوش والسقوط.`, () => ({})))
  chunks[3].push(group(WATCHES, 'watches', 'watches', (a) => `${a[0]} — تتبع صحتك ولياقتك بأسلوب أنيق، أصلية بضمان المتجر.`, (a, i) => ({ battery: rot(['18 ساعة', 'حتى 14 يوم', 'حتى 10 أيام', 'حتى 36 ساعة'], i), os: rot(['watchOS', 'Wear OS', 'Zepp OS', 'MagicOS'], i), colors: rot(['أسود', 'فضي', 'ذهبي'], i) })))
  chunks[3].push(group(ACCESSORIES, 'accessories', 'accessories', (a) => `${a[0]} — إضافة عملية لجهازك بجودة ممتازة وسعر مناسب.`, () => ({})))

  const dir = path.join(__dirname, '..', 'supabase')
  for (const k of [1, 2, 3]) {
    fs.writeFileSync(path.join(dir, `bigseed${k}.sql`), chunks[k].join('\n\n'))
    console.log(`bigseed${k}.sql written (${chunks[k].join('').length} chars)`)
  }
}

main().catch((e) => {
  console.error('FAIL', e)
  process.exit(1)
})
