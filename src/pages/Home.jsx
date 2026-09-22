import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CATEGORY_LIST } from '../lib/constants'
import { useTitle, imgFallback } from '../lib/hooks'
import { useApp } from '../store/AppContext'
import CategoryIcon from '../components/CategoryIcon'
import ProductCard from '../components/ProductCard'
import { SectionTitle, SkeletonGrid } from '../components/UI'

function Slide({ offer: o }) {
  return (
    <div className="relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-4xl bg-ink p-5 text-white sm:gap-5 md:p-8">
      <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-flame/25 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 size-56 rounded-full bg-white/10 blur-[80px]" />
      <div className="relative min-w-0 flex-1">
        {o.discount && (
          <span className="inline-block rounded-full bg-flame px-3.5 py-1.5 text-xs font-extrabold text-white shadow-card">
            خصم {o.discount}
          </span>
        )}
        <h2 className="mt-3 text-xl font-extrabold md:text-2xl">{o.title}</h2>
        {o.description && (
          <p className="mt-1.5 line-clamp-2 max-w-lg text-xs leading-relaxed text-silver-300 md:text-sm">
            {o.description}
          </p>
        )}
        <Link
          to="/shop"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-xs font-extrabold text-ink transition hover:bg-silver-100 active:scale-95"
        >
          تسوق العرض <ArrowLeft className="size-3.5" />
        </Link>
      </div>
      {o.image_url && (
        <img
          src={o.image_url}
          alt={o.title}
          loading="lazy"
          className="relative h-24 w-24 shrink-0 rounded-2xl object-cover shadow-soft transition duration-300 hover:scale-105 sm:h-28 sm:w-28 md:h-36 md:w-36"
        />
      )}
    </div>
  )
}

function OffersCarousel({ offers }) {
  const n = offers.length
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)

  // تقدّم تلقائي — كل إعلان 7 ثوانٍ
  useEffect(() => {
    if (n <= 1 || paused) return
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 7000)
    return () => clearInterval(t)
  }, [n, paused, idx])

  useEffect(() => {
    if (idx >= n) setIdx(0)
  }, [n, idx])

  if (!n) return null

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
    setPaused(true)
  }
  const onTouchEnd = (e) => {
    if (touchX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchX.current
      if (dx > 50) setIdx((i) => (i - 1 + n) % n)
      else if (dx < -50) setIdx((i) => (i + 1) % n)
      touchX.current = null
    }
    setPaused(false)
  }

  return (
    <section>
      <div
        className="relative overflow-hidden rounded-4xl shadow-soft"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex w-full transition-transform duration-700 ease-out" style={{ transform: `translateX(${idx * 100}%)` }}>
          {offers.map((o) => (
            <Slide key={o.id} offer={o} />
          ))}
        </div>
      </div>

      {n > 1 && (
        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`العرض ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-ink' : 'w-1.5 bg-silver-300 hover:bg-silver-400'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function Categories({ categories }) {
  const list = categories.length ? categories : CATEGORY_LIST.map((c, i) => ({ ...c, id: i }))
  return (
    <section>
      <SectionTitle title="تسوق حسب القسم" subtitle="كل ما يحتاجه هاتفك في مكان واحد" />
      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-8 lg:overflow-visible">
        {list.map((c) => (
          <Link key={c.slug} to={c.slug === 'used' ? '/used' : `/category/${c.slug}`} className="group flex w-20 shrink-0 flex-col items-center gap-2 lg:w-auto">
            <span className="size-16 overflow-hidden rounded-full bg-white shadow-card ring-2 ring-transparent transition duration-300 group-hover:-translate-y-1 group-hover:ring-accent/40 group-hover:shadow-soft lg:size-auto lg:aspect-square lg:w-full">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} loading="lazy" onError={imgFallback} className="size-full object-cover transition duration-300 group-hover:scale-110" />
              ) : (
                <span className="flex size-full items-center justify-center">
                  <CategoryIcon icon={c.icon} className="size-7 text-accent" />
                </span>
              )}
            </span>
            <span className="text-center text-[11px] font-bold leading-tight text-ink">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductRow({ title, subtitle, to, products, loading, badge }) {
  return (
    <section>
      <SectionTitle
        title={<span className="flex items-center gap-2">{badge} {title}</span>}
        subtitle={subtitle}
        action={
          <Link to={to} className="flex shrink-0 items-center gap-1 text-sm font-bold text-accent transition hover:gap-2">
            عرض الكل <ArrowLeft className="size-4" />
          </Link>
        }
      />
      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 md:gap-4">
          {products.map((p) => (
            <div key={p.id} className="w-40 shrink-0 md:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function TopupBanner() {
  return (
    <section>
      <Link
        to="/topup"
        className="group relative block overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-soft transition hover:shadow-glow md:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-flame/25 blur-[70px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-white/10 blur-[70px]" />
        <div className="relative flex items-center gap-5">
          <span className="text-4xl transition duration-300 group-hover:scale-110 md:text-5xl">⚡</span>
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-flame px-3 py-1 text-[10px] font-extrabold text-white">جديد</span>
            <h3 className="mt-2 text-xl font-extrabold md:text-2xl">شحن تطبيقات وألعاب</h3>
            <p className="mt-1 line-clamp-2 text-xs text-silver-300 md:text-sm">
              أكثر من 80 لعبة وتطبيق — شدات، جواهر، عملات، بطاقات واشتراكات · الدفع عبر USDT 💰
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-xs font-extrabold text-ink transition group-hover:bg-silver-100 active:scale-95 sm:flex">
            اطلب شحنك <ArrowLeft className="size-3.5" />
          </span>
        </div>
      </Link>
    </section>
  )
}

function PushEnableBanner() {
  const { toast } = useApp()
  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)
  if (typeof Notification === 'undefined' || Notification.permission !== 'default' || hidden) return null

  const enable = async () => {
    setBusy(true)
    try {
      const { enablePushNotifications } = await import('../lib/push')
      const p = await enablePushNotifications()
      if (p === 'granted') toast('تم التفعيل — ستصلك الإشعارات حتى والتطبيق مغلق 🔔')
      else if (p === 'denied') toast('رُفض الإذن — فعّله من إعدادات المتصفح', 'error')
      else if (p === 'unsupported') toast('هذا الجهاز لا يدعم الإشعارات الخارجية', 'error')
    } catch {
      toast('تعذر التفعيل — افتح صفحة الإشعارات وحاول مجددًا', 'error')
    }
    setBusy(false)
    setHidden(true)
  }

  return (
    <section>
      <button
        onClick={enable}
        disabled={busy}
        className="flex w-full items-center gap-4 rounded-3xl bg-ink p-5 text-right text-white shadow-soft transition hover:bg-ink-800 disabled:opacity-60 md:p-6"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-ink">🔔</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold md:text-base">لا تفوّت جديد المتجر — فعّل الإشعارات الخارجية</span>
          <span className="block text-xs text-silver-300">تنبيه فوري على شاشة جهازك حتى والتطبيق مغلق · الأجهزة الجديدة والعروض</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-ink">تفعيل</span>
      </button>
    </section>
  )
}

export default function Home() {
  useTitle('الرئيسية')
  const [newPhones, setNewPhones] = useState([])
  const [used, setUsed] = useState([])
  const [offers, setOffers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from('products').select('*, product_images(url, sort_order)').eq('condition', 'new').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('products').select('*, product_images(url, sort_order)').eq('condition', 'used').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('offers').select('*').eq('is_active', true).gte('ends_at', new Date().toISOString().slice(0, 10)).limit(6),
      supabase.from('categories').select('*').order('sort_order'),
    ]).then(([n, u, o, c]) => {
      if (!active) return
      setNewPhones(n.data || [])
      setUsed(u.data || [])
      setOffers(o.data || [])
      setCategories(c.data || [])
      setLoading(false)
    }).catch(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-10">
      <PushEnableBanner />
      <OffersCarousel offers={offers} />
      <Categories categories={categories} />
      <ProductRow
        title="أحدث الهواتف الجديدة"
        subtitle="أحدث الموديلات بضمان المتجر"
        to="/new"
        badge={<span className="text-xl">📱</span>}
        products={newPhones}
        loading={loading}
      />
      <ProductRow
        title="أجهزة مستعملة بحالة ممتازة"
        subtitle="مفحوصة ومضمونة — بأسعار أوفر"
        to="/used"
        badge={<span className="text-xl">♻️</span>}
        products={used}
        loading={loading}
      />
      <TopupBanner />
    </div>
  )
}
