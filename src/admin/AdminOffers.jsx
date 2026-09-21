import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'
import { Confirm, EmptyState } from '../components/UI'

const inputCls = 'w-full rounded-xl border border-silver-200 bg-white px-4 py-2.5 text-sm font-bold outline-none transition focus:border-accent'
const empty = { title: '', description: '', discount: '', image_url: '', starts_at: '', ends_at: '', product_ids: [], is_active: true }

export default function AdminOffers() {
  useTitle('إدارة العروض')
  const { toast } = useApp()
  const [list, setList] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState(null)
  const [prodSearch, setProdSearch] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('offers').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, brand'),
    ]).then(([o, p]) => {
      setList(o.data || [])
      setProducts(p.data || [])
      setLoading(false)
    })
  }, [])

  const filteredProducts = useMemo(() => {
    if (!prodSearch.trim()) return products.slice(0, 30)
    const t = prodSearch.trim().toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t)).slice(0, 30)
  }, [products, prodSearch])

  const toggleProduct = (pid) =>
    setEditing((f) => ({
      ...f,
      product_ids: f.product_ids.includes(pid) ? f.product_ids.filter((x) => x !== pid) : [...f.product_ids, pid],
    }))

  const save = async (e) => {
    e.preventDefault()
    if (!editing.title?.trim()) return toast('أدخل عنوان العرض', 'error')
    setSaving(true)
    const payload = {
      title: editing.title.trim(),
      description: editing.description?.trim() || '',
      discount: editing.discount?.trim() || '',
      image_url: editing.image_url?.trim() || null,
      starts_at: editing.starts_at || null,
      ends_at: editing.ends_at || null,
      product_ids: editing.product_ids || [],
      is_active: editing.is_active,
    }
    const q = editing.id ? supabase.from('offers').update(payload).eq('id', editing.id) : supabase.from('offers').insert(payload)
    const { error } = await q
    setSaving(false)
    if (error) return toast('خطأ: ' + error.message, 'error')
    const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
    setList(data || [])
    setEditing(null)
    toast('تم حفظ العرض ✅')
  }

  const remove = async () => {
    const { error } = await supabase.from('offers').delete().eq('id', del)
    setDel(null)
    if (error) return toast('تعذر الحذف', 'error')
    setList((l) => l.filter((o) => o.id !== del))
    toast('تم حذف العرض')
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-accent" /></div>

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">العروض</h1>
          <p className="text-sm text-silver-500">{list.length} عرض</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-glow active:scale-95">
          <Plus className="size-4" /> عرض جديد
        </button>
      </div>

      {editing && (
        <form onSubmit={save} className="mb-5 animate-slide-in space-y-4 rounded-3xl bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-ink">{editing.id ? 'تعديل العرض' : 'عرض جديد'}</h2>
            <button type="button" onClick={() => setEditing(null)} className="flex size-9 items-center justify-center rounded-full bg-paper"><X className="size-4" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className={inputCls} placeholder="عنوان العرض *" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <input className={inputCls} placeholder="الخصم (مثال: 20%)" value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: e.target.value })} />
          </div>
          <textarea className={`${inputCls} resize-none`} rows={2} placeholder="وصف العرض" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <input className={inputCls} type="date" value={editing.starts_at || ''} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })} />
            <input className={inputCls} type="date" value={editing.ends_at || ''} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })} />
            <input className={inputCls} dir="ltr" placeholder="رابط صورة البانر" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
          </div>

          <div className="rounded-2xl border border-silver-100 p-3">
            <p className="mb-2 text-xs font-bold text-silver-500">المنتجات المرتبطة</p>
            <input className={`${inputCls} mb-2`} placeholder="ابحث عن منتج..." value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
            <div className="grid max-h-44 gap-1.5 overflow-y-auto sm:grid-cols-2">
              {filteredProducts.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-xl bg-paper px-3 py-2 text-xs font-bold text-ink">
                  <input type="checkbox" checked={editing.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} className="size-4 accent-[#09090B]" />
                  <span className="line-clamp-1">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex w-fit items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="size-4 accent-[#09090B]" />
            العرض مفعّل
          </label>

          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-glow active:scale-95 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} حفظ العرض
          </button>
        </form>
      )}

      {list.length === 0 && !editing ? (
        <EmptyState title="لا توجد عروض" desc="أنشئ أول عرض لجذب العملاء." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((o) => (
            <div key={o.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card">
              {o.image_url && <img src={o.image_url} alt="" className="size-16 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="line-clamp-1 text-sm font-extrabold text-ink">{o.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${o.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-paper text-silver-400'}`}>
                    {o.is_active ? 'مفعّل' : 'موقوف'}
                  </span>
                </div>
                {o.discount && <span className="mt-1 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">خصم {o.discount}</span>}
                <p className="mt-1 line-clamp-2 text-xs text-silver-500">{o.description}</p>
                {(o.starts_at || o.ends_at) && (
                  <p className="mt-1 text-[11px] text-silver-400">
                    {o.starts_at || '...'} → {o.ends_at || '...'}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button onClick={() => setEditing({ ...empty, ...o })} className="flex size-9 items-center justify-center rounded-full bg-paper text-ink transition hover:bg-accent-soft hover:text-accent" aria-label="تعديل">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => setDel(o.id)} className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" aria-label="حذف">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Confirm open={!!del} desc="سيتم حذف العرض نهائيًا." onCancel={() => setDel(null)} onConfirm={remove} />
    </div>
  )
}
