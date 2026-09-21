import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { COMPARE_MAX } from '../lib/constants'

const AppContext = createContext(null)

const read = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return v ?? fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

export function AppProvider({ children }) {
  const [cart, setCart] = useState(() => read('mb_cart', [])) // [{id, qty}]
  const [favorites, setFavorites] = useState(() => read('mb_favs', [])) // [id]
  const [compare, setCompare] = useState(() => read('mb_compare', [])) // [id]
  const [guestOrders, setGuestOrders] = useState(() => read('mb_orders', []))
  const [profile, setProfile] = useState(() => read('mb_profile', { name: '', phone: '' }))
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [toasts, setToasts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notifSeen, setNotifSeen] = useState(() => localStorage.getItem('mb_notif_seen') || '')

  useEffect(() => write('mb_cart', cart), [cart])
  useEffect(() => write('mb_favs', favorites), [favorites])
  useEffect(() => write('mb_compare', compare), [compare])
  useEffect(() => write('mb_orders', guestOrders), [guestOrders])
  useEffect(() => write('mb_profile', profile), [profile])

  // ---- auth ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let active = true
    if (!user) {
      setIsAdmin(false)
      return
    }
    supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setIsAdmin(!!data)
      })
    return () => {
      active = false
    }
  }, [user])

  // ---- toasts ----
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  // ---- cart ----
  const addToCart = useCallback(
    (product, qty = 1) => {
      if (Number(product?.stock ?? 0) <= 0) {
        toast('هذا المنتج غير متوفر حاليًا', 'error')
        return
      }
      setCart((c) => {
        const found = c.find((i) => i.id === product.id)
        if (found) return c.map((i) => (i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, product.stock || 99) } : i))
        return [...c, { id: product.id, qty }]
      })
      toast('تمت الإضافة إلى السلة 🛒')
    },
    [toast]
  )

  const setQty = useCallback((id, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i))))
  }, [])

  const removeFromCart = useCallback((id) => setCart((c) => c.filter((i) => i.id !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])

  // ---- favorites ----
  const toggleFav = useCallback(
    (id) => {
      setFavorites((f) => {
        const has = f.includes(id)
        toast(has ? 'أُزيل من المفضلة' : 'أُضيف إلى المفضلة ❤️')
        return has ? f.filter((x) => x !== id) : [...f, id]
      })
    },
    [toast]
  )
  const inFav = useCallback((id) => favorites.includes(id), [favorites])

  // ---- compare ----
  const toggleCompare = useCallback(
    (id) => {
      setCompare((c) => {
        if (c.includes(id)) return c.filter((x) => x !== id)
        if (c.length >= COMPARE_MAX) {
          toast(`يمكن مقارنة ${COMPARE_MAX} أجهزة كحد أقصى`, 'error')
          return c
        }
        toast('أُضيف إلى المقارنة')
        return [...c, id]
      })
    },
    [toast]
  )
  const inCompare = useCallback((id) => compare.includes(id), [compare])
  const clearCompare = useCallback(() => setCompare([]), [])

  // ---- notifications ----
  const unreadCount = useMemo(
    () => notifications.filter((n) => n.created_at > notifSeen).length,
    [notifications, notifSeen]
  )

  const markNotificationsSeen = useCallback(() => {
    const now = new Date().toISOString()
    localStorage.setItem('mb_notif_seen', now)
    setNotifSeen(now)
  }, [])

  useEffect(() => {
    let active = true
    const load = () =>
      supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)
        .then(({ data }) => {
          if (active && data) setNotifications(data)
        })
        .catch(() => {})
    load()
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new
        if (!active || !n) return
        setNotifications((list) => (list.some((x) => x.id === n.id) ? list : [n, ...list].slice(0, 30)))
        if (n.created_at > (localStorage.getItem('mb_notif_seen') || '')) {
          toast(n.title, 'success')
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker?.getRegistration?.().then((reg) => {
              reg?.showNotification(n.title, {
                body: n.body || '',
                icon: '/icons/icon-192.png',
                data: { url: n.product_id ? '/product/' + n.product_id : '/shop' },
              })
            })
          }
        }
      })
      .subscribe()
    const poll = setInterval(load, 90000)
    return () => {
      active = false
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [toast])

  // ---- guest orders ----
  const addGuestOrder = useCallback((order, items) => {
    setGuestOrders((o) => [{ order, items, local: true }, ...o])
  }, [])

  // auto re-subscribe devices that already approved external notifications
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    import('../lib/push')
      .then(({ enablePushNotifications }) => enablePushNotifications())
      .catch(() => {})
  }, [])

  const value = {
    cart, addToCart, setQty, removeFromCart, clearCart, cartCount,
    favorites, toggleFav, inFav,
    compare, toggleCompare, inCompare, clearCompare,
    guestOrders, addGuestOrder,
    profile, setProfile,
    user, isAdmin, authReady,
    toast, toasts,
    notifications, unreadCount, markNotificationsSeen,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
