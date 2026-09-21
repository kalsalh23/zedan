import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'
import CategoryIcon from '../components/CategoryIcon'
import { Confirm } from '../components/UI'

const ICONS = ['smartphone', 'recycle', 'headphones', 'plug', 'shield', 'watch', 'puzzle']
const inputCls = 'w-full rounded-xl border border-silver-200 bg-white px-4 py-2.5 text-sm font-bold outline-none transition focus:border-accent'

export default function AdminCategories() {
  useTitle('إدارة الأقسام')
  const { toast } = useApp()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | {} | row
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState(null)

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setList(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    if (!editing.name?.trim()) return toast('أدخل اسم القسم', 'error')
    setSaving(true)
    const payload = {
      name: editing.name.trim(),
      slug: editing.slug?.trim() || editing.name.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: editing.icon || 'box',
      image_url: editing.image_url?.trim() || null,
      sort_order: Number(editing.sort_order || 0),
    }
    const q = editing.id
      ? supabase.from('categories').update(payload).eq('id', editing.id)
      : supabase.from('categories').insert(payload)
    const { error } = await q
    setSaving(false)
    if (error) return toast('خطأ: ' + error.message, 'error')
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setList(data || [])
    setEditing(null)
    toast('تم الحفظ ✅')
  }

  const remove = async () => {
    const { error } = await supabase.from('categories').delete().eq('id', del)
    setDel(null)
    if (error) return toast('تعذر الحذف — تأكد ألا توجد منتجات في هذا القسم', 'error')
    setList((l) => l.filter((c) => c.id !== del))
    toast('تم حذف القسم')
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-accent" /></div>

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">الأقسام</h1>
          <p className="text-sm text-silver-500">{list.length} قسم</p>
        </div>
        <button onClick={() => setEditing({})} className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-glow active:scale-95">
          <Plus className="size-4" /> قسم جديد
        </button>
      </div>

      {editing && (
        <form onSubmit={save} className="mb-5 animate-slide-in grid gap-4 rounded-3xl bg-white p-5 shadow-card sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-silver-500">اسم القسم *</span>
            <input className={inputCls} value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="سماعات وصوتيات" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-silver-500">المعرّف (slug)</span>
            <input className={inputCls} dir="ltr" value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="audio" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-silver-500">الأيقونة</span>
            <select className={inputCls} value={editing.icon || 'smartphone'} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-silver-500">صورة القسم (رابط صورة واقعية)</span>
            <input className={inputCls} dir="ltr" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://...jpg" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-silver-500">الترتيب</span>
            <input type="number" className={inputCls} value={editing.sort_order ?? ''} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-60">
              {saving && <Loader2 className="size-4 animate-spin" />} حفظ
            </button>
            <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-full bg-paper py-3 text-sm font-bold text-ink active:scale-95">إلغاء</button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
            {c.image_url ? (
              <img src={c.image_url} alt={c.name} className="size-12 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-paper text-accent">
                <CategoryIcon icon={c.icon} className="size-6" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">{c.name}</p>
              <p className="text-xs text-silver-400" dir="ltr">{c.slug}</p>
            </div>
            <button onClick={() => setEditing(c)} className="flex size-9 items-center justify-center rounded-full bg-paper text-ink transition hover:bg-accent-soft hover:text-accent" aria-label="تعديل">
              <Pencil className="size-4" />
            </button>
            <button onClick={() => setDel(c.id)} className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" aria-label="حذف">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <Confirm open={!!del} desc="سيتم حذف القسم نهائيًا." onCancel={() => setDel(null)} onConfirm={remove} />
    </div>
  )
}
