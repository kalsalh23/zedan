import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Loader2, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { formatPrice, conditionLabel } from '../lib/format'
import { useTitle, imgFallback } from '../lib/hooks'
import { Spinner, EmptyState, Confirm } from '../components/UI'

export default function AdminProducts() {
  useTitle('إدارة المنتجات')
  const { toast } = useApp()
  const [list, setList] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cond, setCond] = useState('all')
  const [del, setDel] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ]).then(([p, c]) => {
      setList(p.data || [])
      setCategories(c.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let l = list
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      l = l.filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t))
    }
    if (cond !== 'all') l = l.filter((p) => p.condition === cond)
    return l
  }, [list, q, cond])

  const remove = async () => {
    setDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', del)
    setDeleting(false)
    setDel(null)
    if (error) return toast('تعذر حذف المنتج', 'error')
    setList((l) => l.filter((p) => p.id !== del))
    toast('تم حذف المنتج')
  }

  const catName = (p) => p.categories?.name || '—'
  const lowStock = (p) => Number(p.stock) > 0 && Number(p.stock) <= 3

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">المنتجات</h1>
          <p className="text-sm text-silver-500">{list.length} منتج في المتجر</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95"
        >
          <Plus className="size-4" /> إضافة منتج
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card">
          <Search className="size-4 text-silver-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو الشركة..." className="w-full bg-transparent text-sm font-bold outline-none" />
        </div>
        <select value={cond} onChange={(e) => setCond(e.target.value)} className="rounded-full bg-white px-4 py-2.5 text-sm font-bold shadow-card outline-none">
          <option value="all">الكل</option>
          <option value="new">جديد</option>
          <option value="used">مستعمل</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا توجد منتجات" desc="أضف أول منتج للمتجر." />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
              <img src={p.main_image} alt={p.name} onError={imgFallback} className="size-14 shrink-0 rounded-xl bg-paper object-contain p-1" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-extrabold text-ink">{p.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                  <span className={`rounded-full px-2 py-0.5 ${p.condition === 'used' ? 'bg-ink text-white' : 'bg-accent-soft text-accent'}`}>{conditionLabel(p.condition)}</span>
                  <span className="rounded-full bg-paper px-2 py-0.5 text-silver-500">{catName(p)}</span>
                  <span className={`rounded-full px-2 py-0.5 ${lowStock(p) ? 'bg-amber-50 text-amber-600' : 'bg-paper text-silver-500'}`}>
                    مخزون: {p.stock}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-extrabold text-ink">{formatPrice(p.price)}</span>
              <div className="flex shrink-0 gap-1.5">
                <Link to={`/admin/products/${p.id}/edit`} className="flex size-9 items-center justify-center rounded-full bg-paper text-ink transition hover:bg-accent-soft hover:text-accent active:scale-90" aria-label="تعديل">
                  <Pencil className="size-4" />
                </Link>
                <button onClick={() => setDel(p.id)} className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 active:scale-90" aria-label="حذف">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Confirm
        open={!!del}
        desc={`سيتم حذف "${list.find((p) => p.id === del)?.name || ''}" وكل صوره نهائيًا.`}
        onCancel={() => setDel(null)}
        onConfirm={remove}
      />
    </div>
  )
}
