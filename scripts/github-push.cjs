// Pushes the project to GitHub using the REST API (no local git required)
// Handles the "empty repository" 409 case by initializing with one file first.
const fs = require('fs')
const path = require('path')
const https = require('https')

const TOKEN = process.env.GH_TOKEN
const OWNER = 'kalsalh23'
const REPO = 'zedan'
const ROOT = path.resolve(__dirname, '..')

const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git', '.vercel'])

function api(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: p,
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'zedan-uploader',
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let b = ''
        res.on('data', (c) => (b += c))
        res.on('end', () => {
          if (res.statusCode >= 300) {
            const err = new Error(`${res.statusCode} ${b.slice(0, 300)}`)
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

function walk(dir, base = '') {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(name) || name.startsWith('.env')) continue
    const full = path.join(dir, name)
    const rel = base ? `${base}/${name}` : name
    const st = fs.statSync(full)
    if (st.isDirectory()) out.push(...walk(full, rel))
    else if (st.isFile()) out.push({ rel, full })
  }
  return out
}

async function main() {
  const repo = await api('GET', `/repos/${OWNER}/${REPO}`)
  const BRANCH = repo.default_branch || 'main'
  console.log('default branch:', BRANCH)

  let parent = null
  let baseTree = undefined
  try {
    const head = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`)
    parent = head.object.sha
    const c = await api('GET', `/repos/${OWNER}/${REPO}/git/commits/${parent}`)
    baseTree = c.tree.sha
    console.log('existing head:', parent.slice(0, 8))
  } catch (e) {
    console.log('branch missing/empty — initializing with first commit via Contents API')
    const readme = Buffer.from(
      `# Mobily Bro — متجر الهواتف والإكسسوارات\n\nمتجر إلكتروني كامل (React + Tailwind + Supabase) بواجهة عربية RTL، مقارنة هواتف، طلب عبر WhatsApp، ولوحة تحكم للإدارة.\n\n- Live: https://mobily-bro.vercel.app\n`,
      'utf8'
    ).toString('base64')
    const created = await api('PUT', `/repos/${OWNER}/${REPO}/contents/README.md`, {
      message: 'init: Mobily Bro store',
      content: readme,
      branch: BRANCH,
    })
    parent = created.commit.sha
    const c = await api('GET', `/repos/${OWNER}/${REPO}/git/commits/${parent}`)
    baseTree = c.tree.sha
    console.log('initialized head:', parent.slice(0, 8))
  }

  const files = walk(ROOT).filter((f) => f.rel !== 'README.md')
  console.log('files to upload:', files.length)

  const tree = []
  let i = 0
  for (const f of files) {
    const content = fs.readFileSync(f.full)
    const blob = await api('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
      content: content.toString('base64'),
      encoding: 'base64',
    })
    tree.push({ path: f.rel, mode: '100644', type: 'blob', sha: blob.sha })
    if (++i % 10 === 0) console.log('blobs', i)
  }

  const newTree = await api('POST', `/repos/${OWNER}/${REPO}/git/trees`, { base_tree: baseTree, tree })
  const commit = await api('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: 'Mobily Bro — full e-commerce store (React + Tailwind + Supabase, Arabic RTL, WhatsApp ordering, admin dashboard)',
    tree: newTree.sha,
    parents: [parent],
  })
  await api('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, { sha: commit.sha })
  console.log('pushed commit:', commit.sha)
  console.log('https://github.com/' + OWNER + '/' + REPO)
}

main().catch((e) => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
