import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Plus, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'
import { EmptyState, Spinner, Confirm } from '../components/UI'

export default function Addresses() {
  useTitle('العناوين')
  const { user, toast } = useApp()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState(null)
  const [form, setForm] = useState({ city: '', area: '', details: '', notes: '', is_default: false })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setList(data || [])
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
  }, [user])

  if (!user)
    return (
      <EmptyState
        icon={MapPin}
        title="سجّل الدخول لإدارة عناوينك"
        desc="العناوين المحفوظة تُستخدم عند اختيار التوصيل إلى المنزل."
        action={<Link to="/account" className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-glow">تسجيل الدخول</Link>}
      />
    )

  if (loading) return <Spinner />

  const save = async (e) => {
    e.preventDefault()
    if (!form.city || !form.area || !form.details) {
      toast('أكمل الحقول المطلوبة', 'error')
      return
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...form, user_id: user.id })
      .select()
      .single()
    setSaving(false)
    if (error) return toast('تعذر الحفظ', 'error')
    setList((l) => [data, ...l])
    setForm({ city: '', area: '', details: '', notes: '', is_default: false })
    setShowForm(false)
    toast('تم حفظ العنوان 📍')
  }

  const remove = async (id) => {
    setDel(null)
    await supabase.from('addresses').delete().eq('id', id)
    setList((l) => l.filter((a) => a.id !== id))
    toast('تم حذف العنوان')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink md:text-3xl">عناويني</h1>
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95">
          <Plus className="size-4" /> عنوان جديد
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-5 animate-slide-in space-y-4 rounded-3xl bg-white p-5 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="المدينة *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
            <input placeholder="المنطقة *" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
          </div>
          <input placeholder="العنوان بالتفصيل *" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
          <input placeholder="ملاحظات (اختياري)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} حفظ العنوان
          </button>
        </form>
      )}

      {list.length === 0 && !showForm ? (
        <EmptyState icon={MapPin} title="لا توجد عناوين محفوظة" desc="أضف عنوان توصيل ليُستخدم تلقائيًا عند الطلب." />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-card">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-paper text-accent">
                <MapPin className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-ink">{a.city} — {a.area}</p>
                <p className="text-xs leading-relaxed text-silver-500">{a.details}</p>
                {a.notes && <p className="mt-1 text-xs text-silver-400">📝 {a.notes}</p>}
              </div>
              <button onClick={() => setDel(a.id)} className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 active:scale-90" aria-label="حذف">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Confirm open={!!del} desc="سيتم حذف هذا العنوان نهائيًا." onCancel={() => setDel(null)} onConfirm={() => remove(del)} />
    </div>
  )
}
