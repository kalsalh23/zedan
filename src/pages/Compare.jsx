import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, GitCompare, Plus } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useProductsByIds, useTitle, imgFallback } from '../lib/hooks'
import { formatPrice } from '../lib/format'
import { EmptyState, Spinner } from '../components/UI'

const ROWS = [
  { key: 'price', label: 'السعر', render: (p) => <span className="font-extrabold text-accent">{formatPrice(p.price)}</span> },
  { key: 'condition', label: 'الحالة', render: (p) => (p.condition === 'used' ? '♻️ مستعمل' : '✨ جديد') },
  { key: 'screen', label: 'الشاشة', get: (p) => p.specs?.screen },
  { key: 'processor', label: 'المعالج', get: (p) => p.specs?.processor },
  { key: 'ram', label: 'RAM', get: (p) => p.specs?.ram },
  { key: 'storage', label: 'التخزين', get: (p) => p.specs?.storage },
  { key: 'camera', label: 'الكاميرات', get: (p) => p.specs?.camera },
  { key: 'battery', label: 'البطارية', get: (p) => p.specs?.battery },
  { key: 'network', label: 'الشبكة', get: (p) => p.network },
  { key: 'os', label: 'نظام التشغيل', get: (p) => p.specs?.os },
  { key: 'colors', label: 'الألوان', get: (p) => p.specs?.colors },
  { key: 'overall_condition', label: 'حالة الجهاز', used: true, get: (p) => p.used_details?.overall_condition },
  { key: 'battery_health', label: 'صحة البطارية', used: true, get: (p) => p.used_details?.battery_health && `${p.used_details.battery_health}%` },
]

export default function Compare() {
  useTitle('مقارنة الهواتف')
  const { compare, toggleCompare, clearCompare } = useApp()
  const { products, loading } = useProductsByIds(compare)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && compare.length > 0 && products.length === 0) {
      // ids point to deleted products — clear
    }
  }, [loading, products, compare])

  const ordered = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">مقارنة الهواتف</h1>
          <p className="mt-1 text-sm text-silver-500">قارن حتى 3 أجهزة جنبًا إلى جنب واختر الأفضل لك</p>
        </div>
        {ordered.length > 0 && (
          <button onClick={clearCompare} className="rounded-full bg-paper px-4 py-2 text-xs font-bold text-silver-500 transition hover:text-red-500">
            مسح الكل
          </button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : ordered.length === 0 ? (
        <EmptyState
          icon={GitCompare}
          title="لم تختر أجهزة للمقارنة بعد"
          desc="أضف هاتفين أو ثلاثة من صفحات المتجر باستخدام زر المقارنة، ثم عد هنا لمشاهدة المقارنة."
          action={
            <Link to="/shop" className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95">
              تصفح المنتجات
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="w-28 bg-paper p-3 text-right text-xs font-bold text-silver-400 md:w-36">المواصفات</th>
                {ordered.map((p) => (
                  <th key={p.id} className="min-w-40 p-3 align-top">
                    <div className="relative mx-auto w-fit">
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className="absolute -right-2 -top-2 z-10 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow-card transition hover:bg-red-600"
                        aria-label="إزالة"
                      >
                        <X className="size-3.5" />
                      </button>
                      <Link to={`/product/${p.id}`}>
                        <img src={p.main_image} alt={p.name} onError={imgFallback} className="mx-auto size-20 rounded-xl bg-paper object-contain p-1 md:size-24" />
                      </Link>
                    </div>
                    <Link to={`/product/${p.id}`} className="mt-2 block text-sm font-extrabold text-ink hover:text-accent">{p.name}</Link>
                    <p className="text-xs font-bold text-silver-400">{p.brand}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.filter((r) => !r.used || ordered.some((p) => p.condition === 'used')).map((row, i) => (
                <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-paper/60'}>
                  <td className="p-3 text-xs font-extrabold text-ink">{row.label}</td>
                  {ordered.map((p) => (
                    <td key={p.id} className="p-3 text-center text-xs font-bold text-silver-500">
                      {row.render ? row.render(p) : row.get?.(p) || <span className="text-silver-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ordered.length > 0 && ordered.length < 3 && (
        <button
          onClick={() => navigate('/shop')}
          className="mx-auto mt-6 flex items-center gap-2 rounded-full border-2 border-dashed border-silver-200 px-6 py-3 text-sm font-bold text-silver-400 transition hover:border-accent hover:text-accent"
        >
          <Plus className="size-4" /> إضافة جهاز آخر للمقارنة
        </button>
      )}
    </div>
  )
}
