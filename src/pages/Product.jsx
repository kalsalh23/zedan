import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Heart, ShoppingCart, GitCompare, Signal, Recycle, ShieldCheck, BatteryFull,
  Smartphone, Cpu, MemoryStick, HardDrive, Camera, BatteryCharging, MonitorSmartphone,
  Fingerprint, Volume2, Plug, Package, ShieldPlus, Clock3, FileText, CheckCircle2, Store,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTitle, imgFallback } from '../lib/hooks'
import { formatPrice, isAvailable } from '../lib/format'
import { useApp } from '../store/AppContext'
import Gallery from '../components/Gallery'
import ProductCard from '../components/ProductCard'
import { Spinner, ErrorState, SectionTitle } from '../components/UI'

const SPEC_ROWS = [
  { key: 'screen', label: 'الشاشة', icon: MonitorSmartphone },
  { key: 'processor', label: 'المعالج', icon: Cpu },
  { key: 'ram', label: 'RAM', icon: MemoryStick },
  { key: 'storage', label: 'التخزين', icon: HardDrive },
  { key: 'camera', label: 'الكاميرات', icon: Camera },
  { key: 'battery', label: 'البطارية', icon: BatteryCharging },
  { key: 'os', label: 'نظام التشغيل', icon: Smartphone },
  { key: 'colors', label: 'الألوان', icon: Package },
]

const USED_ROWS = [
  { key: 'overall_condition', label: 'الحالة العامة' },
  { key: 'battery_health', label: 'صحة البطارية', suffix: '%', icon: BatteryFull },
  { key: 'screen_condition', label: 'حالة الشاشة' },
  { key: 'body_condition', label: 'حالة الهيكل' },
  { key: 'cameras', label: 'الكاميرات' },
  { key: 'face_id', label: 'Face ID / البصمة' },
  { key: 'speakers', label: 'السماعات' },
  { key: 'charging', label: 'الشحن' },
  { key: 'port', label: 'منفذ الشحن' },
  { key: 'accessories', label: 'الملحقات المرفقة' },
  { key: 'warranty', label: 'الضمان' },
  { key: 'usage_duration', label: 'مدة الاستخدام' },
  { key: 'notes', label: 'ملاحظات إضافية' },
]

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleFav, inFav, toggleCompare, inCompare } = useApp()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [related, setRelated] = useState([])

  useTitle(p?.name)

  useEffect(() => {
    let active = true
    setLoading(true)
    setFailed(false)
    setP(null)
    supabase
      .from('products')
      .select('*, product_images(url, sort_order), categories(name, slug)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        if (!data) setFailed(true)
        else setP(data)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setFailed(true)
        setLoading(false)
      })
    window.scrollTo({ top: 0 })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!p) return
    let active = true
    supabase
      .from('products')
      .select('*, product_images(url, sort_order)')
      .eq('condition', p.condition)
      .eq('is_active', true)
      .neq('id', p.id)
      .limit(4)
      .then(({ data }) => {
        if (active) setRelated(data || [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [p?.id])

  if (loading) return <Spinner />
  if (failed || !p)
    return (
      <ErrorState
        title="المنتج غير موجود"
        desc="قد يكون المنتج قد حُذف أو الرابط غير صحيح."
        onRetry={null}
      />
    )

  const images = (p.product_images || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((i) => i.url)
  if (!images.length && p.main_image) images.push(p.main_image)
  const used = p.condition === 'used'
  const ud = p.used_details || {}
  const available = isAvailable(p)
  const catSlug = p.categories?.slug === 'used' ? null : p.categories?.slug

  return (
    <div className="animate-fade-up">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-bold text-silver-400">
        <Link to="/" className="hover:text-accent">الرئيسية</Link>
        <span>/</span>
        <Link to={used ? '/used' : catSlug ? `/category/${catSlug}` : '/shop'} className="hover:text-accent">
          {used ? 'أجهزة مستعملة' : p.categories?.name || 'المتجر'}
        </Link>
        <span>/</span>
        <span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <Gallery images={images} name={p.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {used ? (
              <span className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                <Recycle className="size-3.5" /> مستعمل
              </span>
            ) : (
              <span className="rounded-full bg-silver-200 px-3 py-1 text-xs font-bold text-ink">جديد</span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-card">
              <Signal className="size-3.5" /> {p.network}
            </span>
            {used && ud.overall_condition && (
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-silver-500">الحالة: {ud.overall_condition}</span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-ink md:text-3xl">{p.name}</h1>
          <p className="mt-1 text-sm font-bold text-silver-400">{p.brand}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-ink">{formatPrice(p.price)}</span>
            {p.old_price && Number(p.old_price) > 0 && (
              <span className="text-lg font-bold text-silver-300 line-through">{formatPrice(p.old_price)}</span>
            )}
          </div>

          <p className={`mt-2 flex items-center gap-1.5 text-sm font-bold ${available ? 'text-emerald-500' : 'text-red-400'}`}>
            <span className={`size-2 rounded-full ${available ? 'bg-emerald-500' : 'bg-red-400'}`} />
            {available ? `متوفر في المخزون${p.stock ? ` (${p.stock} قطعة)` : ''}` : 'غير متوفر حاليًا'}
          </p>

          {p.description && (
            <p className="mt-4 text-sm leading-relaxed text-silver-500">{p.description}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => addToCart(p)}
              disabled={!available}
              className="flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-white transition hover:bg-ink-800 active:scale-95 disabled:bg-silver-200 disabled:text-silver-400"
            >
              <ShoppingCart className="size-4" /> أضف للسلة
            </button>
            <a
              href="/checkout"
              onClick={(e) => {
                e.preventDefault()
                if (!available) return
                addToCart(p)
                navigate('/checkout')
              }}
              className={`flex items-center justify-center gap-2 rounded-full bg-wa py-3.5 text-sm font-bold text-white transition hover:brightness-95 active:scale-95 ${!available && 'pointer-events-none opacity-40'}`}
            >
              <Store className="size-4" /> اطلب الآن
            </a>
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => toggleFav(p.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm font-bold transition active:scale-95 ${
                inFav(p.id) ? 'border-accent bg-accent-soft text-accent' : 'border-silver-200 text-ink hover:border-silver-300'
              }`}
            >
              <Heart className={`size-4 ${inFav(p.id) ? 'fill-current' : ''}`} />
              {inFav(p.id) ? 'في المفضلة' : 'المفضلة'}
            </button>
            <button
              onClick={() => toggleCompare(p.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm font-bold transition active:scale-95 ${
                inCompare(p.id) ? 'border-accent bg-accent-soft text-accent' : 'border-silver-200 text-ink hover:border-silver-300'
              }`}
            >
              <GitCompare className="size-4" />
              {inCompare(p.id) ? 'في المقارنة' : 'أضف للمقارنة'}
            </button>
          </div>

          {used && (
            <div className="mt-6 rounded-3xl border-2 border-ink/5 bg-white p-5 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
                <ShieldCheck className="size-5 text-accent" /> حالة الجهاز
              </h2>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {USED_ROWS.filter((r) => ud[r.key] !== undefined && ud[r.key] !== null && ud[r.key] !== '').map((r) => (
                  <div key={r.key} className="flex items-center justify-between gap-2 border-b border-dashed border-silver-100 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-silver-500">
                      {r.icon && <r.icon className="size-3.5 text-silver-400" />}
                      {r.label}
                    </span>
                    <span className="text-xs font-extrabold text-ink">{r.suffix ? `${ud[r.key]}${r.suffix}` : ud[r.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {Object.keys(p.specs || {}).length > 0 && (
        <section className="mt-10">
          <SectionTitle title="المواصفات" />
          <div className="grid gap-3 rounded-3xl bg-white p-5 shadow-card sm:grid-cols-2">
            {SPEC_ROWS.filter((r) => p.specs[r.key]).map((r) => (
              <div key={r.key} className="flex items-start gap-3 rounded-2xl bg-paper p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-accent shadow-card">
                  <r.icon className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-silver-400">{r.label}</p>
                  <p className="text-sm font-bold text-ink">{p.specs[r.key]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <SectionTitle title="منتجات مشابهة" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
