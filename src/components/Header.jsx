import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, User, Plus, X, ChevronLeft } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useDebounce, searchProducts, imgFallback } from '../lib/hooks'
import { formatPrice } from '../lib/format'

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-xl bg-accent shadow-glow">
        <Plus className="size-5 text-white" strokeWidth={3} />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Mobily <span className="text-accent">Bro</span>
      </span>
    </Link>
  )
}

export function SearchResults({ q, onDone }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const dq = useDebounce(q, 220)

  useEffect(() => {
    if (!dq.trim()) {
      setItems([])
      return
    }
    let active = true
    setLoading(true)
    searchProducts(dq, 8).then((data) => {
      if (!active) return
      setItems(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [dq])

  if (!dq.trim()) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-silver-100 bg-white shadow-soft">
      {loading && <div className="px-4 py-3 text-sm text-silver-500">جاري البحث...</div>}
      {!loading && items.length === 0 && (
        <div className="px-4 py-3 text-sm text-silver-500">لا توجد نتائج مطابقة</div>
      )}
      {items.map((p) => (
        <Link
          key={p.id}
          to={`/product/${p.id}`}
          onClick={onDone}
          className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-paper"
        >
          <img src={p.main_image} alt={p.name} loading="lazy" onError={imgFallback} className="size-11 rounded-lg bg-paper object-contain" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-ink">{p.name}</div>
            <div className="text-xs text-silver-500">{p.brand}</div>
          </div>
          <span className="shrink-0 text-sm font-extrabold text-ink">{formatPrice(p.price)}</span>
        </Link>
      ))}
      <Link to={`/search?q=${encodeURIComponent(dq)}`} onClick={onDone} className="block bg-paper px-4 py-2.5 text-center text-sm font-bold text-accent">
        عرض كل النتائج
      </Link>
    </div>
  )
}

export default function Header() {
  const { cartCount, favorites, compare, user } = useApp()
  const [q, setQ] = useState('')
  const [overlay, setOverlay] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const navigate = useNavigate()
  const boxRef = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const navItems = [
    { to: '/', label: 'الرئيسية' },
    { to: '/new', label: 'هواتف جديدة' },
    { to: '/used', label: 'أجهزة مستعملة' },
    { to: '/shop', label: 'المتجر' },
    { to: '/compare', label: 'المقارنة', badge: compare.length },
    { to: '/about', label: 'من نحن' },
  ]

  const iconBtn = 'relative flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-paper active:scale-90'

  return (
    <header className="sticky top-0 z-50 border-b border-silver-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-3">
          <Logo />

          {/* desktop nav */}
          <nav className="mr-4 hidden items-center gap-1 lg:flex">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-paper'}`
                }
              >
                {n.label}
                {n.badge > 0 && <span className="ms-1 text-xs text-silver-400">({n.badge})</span>}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          {/* desktop search */}
          <div ref={boxRef} className="relative hidden md:block md:w-72 lg:w-96">
            <div className="flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 ring-accent-ring transition focus-within:ring-2">
              <Search className="size-4 text-silver-400" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setDropOpen(true)
                }}
                onFocus={() => setDropOpen(true)}
                onKeyDown={(e) => e.key === 'Enter' && q.trim() && (navigate(`/search?q=${encodeURIComponent(q)}`), setDropOpen(false))}
                placeholder="ابحث عن هاتف أو منتج..."
                className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-silver-400"
              />
            </div>
            {dropOpen && (
              <div className="absolute inset-x-0 top-full mt-2">
                <SearchResults q={q} onDone={() => setDropOpen(false)} />
              </div>
            )}
          </div>

          {/* mobile search */}
          <button className={`${iconBtn} md:hidden`} onClick={() => setOverlay(true)} aria-label="بحث">
            <Search className="size-5" />
          </button>

          <Link to="/favorites" className={iconBtn} aria-label="المفضلة">
            <Heart className="size-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -left-0.5 flex size-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className={iconBtn} aria-label="السلة">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -left-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/account" className={iconBtn} aria-label="الحساب">
            <User className="size-5" />
            {user && <span className="absolute bottom-1 left-1 size-2 rounded-full bg-emerald-500" />}
          </Link>
        </div>
      </div>

      {/* mobile search overlay */}
      {overlay && (
        <div className="fixed inset-0 z-[80] animate-slide-in bg-white md:hidden">
          <div className="flex items-center gap-2 border-b border-silver-100 px-4 py-3">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-paper px-4 py-2.5">
              <Search className="size-4 text-silver-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && q.trim() && (navigate(`/search?q=${encodeURIComponent(q)}`), setOverlay(false))}
                placeholder="ابحث عن هاتف أو منتج..."
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-silver-400"
              />
            </div>
            <button onClick={() => setOverlay(false)} className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-paper">
              <X className="size-5" />
            </button>
          </div>
          <div className="p-4">
            <SearchResults q={q} onDone={() => setOverlay(false)} />
            <div className="mt-4 flex flex-wrap gap-2">
              {['iPhone', 'Samsung', 'Xiaomi', 'سماعات', 'شاحن'].map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full bg-paper px-4 py-2 text-sm font-bold text-ink transition hover:bg-accent-soft hover:text-accent">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
