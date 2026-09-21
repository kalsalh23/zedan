// Generates branded PWA icons (blue rounded square + white plus) as real PNGs
// without any external image library: pixel math + minimal PNG encoder.
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// ---- minimal PNG encoder ----
let CRC_TABLE = null
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = []
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      CRC_TABLE[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// ---- icon drawing (signed distance fields, 2x2 supersampled) ----
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r)
  const qy = Math.abs(py - cy) - (hh - r)
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(ox, oy) - r
}

const BG = [37, 99, 235] // #2563EB
const FG = [255, 255, 255]

function drawIcon(S, { fullBleed }) {
  const buf = Buffer.alloc(S * S * 4)
  const cx = S / 2
  const cy = S / 2
  const half = S / 2
  const radius = S * 0.24
  const SS = [ -0.25, 0.25 ]
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let aBg = 0
      let aPlus = 0
      for (const sy of SS) {
        for (const sx of SS) {
          const px = x + 0.5 + sx
          const py = y + 0.5 + sy
          const dBg = fullBleed ? -1 : sdRoundRect(px, py, cx, cy, half, half, radius)
          aBg += Math.max(0, Math.min(1, 0.5 - dBg))
          const dH = sdRoundRect(px, py, cx, cy, S * 0.3, S * 0.07, S * 0.035)
          const dV = sdRoundRect(px, py, cx, cy, S * 0.07, S * 0.3, S * 0.035)
          aPlus += Math.max(0, Math.min(1, 0.5 - Math.min(dH, dV)))
        }
      }
      aBg /= 4
      aPlus /= 4
      const i = (y * S + x) * 4
      buf[i] = Math.round(BG[0] * (1 - aPlus) + FG[0] * aPlus)
      buf[i + 1] = Math.round(BG[1] * (1 - aPlus) + FG[1] * aPlus)
      buf[i + 2] = Math.round(BG[2] * (1 - aPlus) + FG[2] * aPlus)
      buf[i + 3] = Math.round(aBg * 255)
    }
  }
  return buf
}

const outDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

const jobs = [
  ['icon-192.png', 192, { fullBleed: false }],
  ['icon-512.png', 512, { fullBleed: false }],
  ['icon-maskable-192.png', 192, { fullBleed: true }],
  ['icon-maskable-512.png', 512, { fullBleed: true }],
  ['apple-touch-icon.png', 180, { fullBleed: true }],
]

for (const [name, size, opts] of jobs) {
  const png = encodePng(size, size, drawIcon(size, opts))
  fs.writeFileSync(path.join(outDir, name), png)
  console.log('written', name, png.length, 'bytes')
}
