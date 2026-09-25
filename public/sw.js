// Mobily Bro service worker — installability + light offline shell
const CACHE = 'mobily-bro-v5'
const CORE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // app navigation: network first, cached shell when offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/index.html')))
    return
  }

  // same-origin static assets: cache first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
            return res
          })
      )
    )
    return
  }

  // cross-origin images (product/category photos): cache first
  if (req.destination === 'image') {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req)
            .then((res) => {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
              return res
            })
            .catch(() => caches.match('/favicon.svg'))
      )
    )
  }
  // Supabase API and everything else: network only → always fresh data
})

// ---- external Web Push (arrives even when the app is closed) ----
self.addEventListener('push', (e) => {
  let data = {}
  try {
    data = e.data.json()
  } catch {
    data = { title: 'Mobily Bro', body: 'يوجد جديد في المتجر' }
  }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Mobily Bro', {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url)) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
