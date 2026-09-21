import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Save, X, Upload, Star, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'

const emptyForm = {
  name: '', brand: '', category_id: '', condition: 'new', network: '4G',
  price: '', old_price: '', stock: '', description: '',
  specs: { screen: '', processor: '', ram: '', storage: '', camera: '', battery: '', os: '', colors: '' },
  used_details: {
    overall_condition: 'ممتازة', battery_health: '', screen_condition: '', body_condition: '',
    cameras: '', face_id: 'تعمل', speakers: '', charging: '', port: '', accessories: '',
    warranty: '', usage_duration: '', notes: '',
  },
  is_active: true,
}

const slugify = (s) =>
  (s || 'product').toString().trim().toLowerCase().replace(/[^\w\u0600-\u06FF]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) + '-' + Date.now().toString(36)

function ImageManager({ images, setImages }) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useApp()

  const upload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    const added = []
    for (const file of Array.from(files)) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) {
        toast('فشل رفع الصورة: ' + error.message, 'error')
        continue
      }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      added.push(data.publicUrl)
    }
    setImages((imgs) => [...imgs, ...added])
    setUploading(false)
  }

  const move = (i, dir) => {
    setImages((imgs) => {
      const next = [...imgs]
      const j = i + dir
      if (j < 0 || j >= next.length) return next
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-silver-200 bg-white p-6 text-center transition hover:border-accent">
        <Upload className="size-6 text-accent" />
        <span className="text-sm font-bold text-ink">{uploading ? 'جاري الرفع...' : 'رفع صور (يمكن اختيار عدة صور)'}</span>
        <span className="text-[11px] text-silver-400">الصورة الأولى هي الصورة الرئيسية — للأجهزة المستعملة ارفع صورًا حقيقية للجهاز</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} disabled={uploading} />
      </label>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, i) => (
            <div key={url + i} className="group relative overflow-hidden rounded-xl bg-paper">
              <img src={url} alt="" className="aspect-square w-full object-contain p-1" />
              {i === 0 && (
                <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-white">
                  <Star className="size-2.5 fill-current" /> رئيسية
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => move(i, 1)} className="flex size-6 items-center justify-center rounded-full bg-white/90 text-ink" aria-label="يمين"><ArrowRight className="size-3" /></button>
                <button type="button" onClick={() => move(i, -1)} className="flex size-6 items-center justify-center rounded-full bg-white/90 text-ink" aria-label="يسار"><ArrowLeft className="size-3" /></button>
                <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))} className="flex size-6 items-center justify-center rounded-full bg-white/90 text-red-500" aria-label="حذف"><Trash2 className="size-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-silver-500">{label}</span>
      {children}
    </label>
  )
}
const inputCls = 'w-full rounded-xl border border-silver-200 bg-white px-4 py-2.5 text-sm font-bold outline-none transition focus:border-accent'

export default function ProductForm() {
  const { id } = useParams()
  const editing = !!id
  useTitle(editing ? 'تعديل منتج' : 'إضافة منتج')
  const { toast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([]) // [{id, url}]
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(editing)

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    if (!editing) return
    supabase
      .from('products')
      .select('*, product_images(id, url, sort_order)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const { product_images, ...rest } = data
          const sorted = (product_images || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          setForm({
            ...emptyForm,
            ...rest,
            old_price: rest.old_price ?? '',
            stock: rest.stock ?? '',
            specs: { ...emptyForm.specs, ...(rest.specs || {}) },
            used_details: { ...emptyForm.used_details, ...(rest.used_details || {}) },
          })
          setExistingImages(sorted)
          setImages(sorted.map((i) => i.url))
        }
        setLoading(false)
      })
  }, [id, editing])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const setSpec = (k, v) => setForm((f) => ({ ...f, specs: { ...f.specs, [k]: v } }))
  const setUsed = (k, v) => setForm((f) => ({ ...f, used_details: { ...f.used_details, [k]: v } }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.price === '' || !form.category_id) {
      toast('أكمل الحقول: الاسم، السعر، القسم', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.brand + ' ' + form.name),
        brand: form.brand.trim(),
        category_id: form.category_id,
        condition: form.condition,
        network: form.network,
        price: Number(form.price),
        old_price: form.old_price === '' ? null : Number(form.old_price),
        stock: Number(form.stock || 0),
        description: form.description?.trim() || '',
        specs: Object.fromEntries(Object.entries(form.specs).filter(([, v]) => v !== '')),
        used_details: form.condition === 'used'
          ? Object.fromEntries(Object.entries(form.used_details).filter(([, v]) => v !== '' && v !== null))
          : null,
        main_image: images[0] || null,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }

      let productId = id
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        productId = data.id
      }

      // sync images
      const keep = existingImages.filter((i) => images.includes(i.url))
      const removeIds = existingImages.filter((i) => !images.includes(i.url)).map((i) => i.id)
      if (removeIds.length) await supabase.from('product_images').delete().in('id', removeIds)
      const existingUrls = new Set(keep.map((i) => i.url))
      const newUrls = images.filter((u) => !existingUrls.has(u))
      if (newUrls.length) {
        await supabase.from('product_images').insert(newUrls.map((url, i) => ({ product_id: productId, url, sort_order: images.indexOf(url) })))
      }
      // update sort for kept ones
      for (const k of keep) {
        const order = images.indexOf(k.url)
        if (order !== k.sort_order) await supabase.from('product_images').update({ sort_order: order }).eq('id', k.id)
      }

      toast(editing ? 'تم حفظ التعديلات ✅' : 'تم إضافة المنتج ✅')
      navigate('/admin/products')
    } catch (err) {
      toast('حدث خطأ: ' + (err.message || ''), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-accent" /></div>

  const used = form.condition === 'used'

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">{editing ? 'تعديل منتج' : 'إضافة منتج جديد'}</h1>
        <button type="button" onClick={() => navigate('/admin/products')} className="flex size-10 items-center justify-center rounded-full bg-white shadow-card"><X className="size-5" /></button>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-card">
        <h2 className="mb-4 font-extrabold text-ink">الصور</h2>
        <ImageManager images={images} setImages={setImages} />
      </section>

      <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-card sm:grid-cols-2">
        <Field label="اسم المنتج *">
          <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="iPhone 16 Pro" required />
        </Field>
        <Field label="الشركة *">
          <input className={inputCls} value={form.brand} onChange={(e) => set({ brand: e.target.value })} placeholder="Apple" required />
        </Field>
        <Field label="القسم *">
          <select className={inputCls} value={form.category_id} onChange={(e) => set({ category_id: e.target.value })} required>
            <option value="">اختر القسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="الحالة *">
          <select className={inputCls} value={form.condition} onChange={(e) => set({ condition: e.target.value })}>
            <option value="new">جديد</option>
            <option value="used">مستعمل ♻️</option>
          </select>
        </Field>
        <Field label="الشبكة *">
          <select className={inputCls} value={form.network} onChange={(e) => set({ network: e.target.value })}>
            <option value="4G">4G</option>
            <option value="5G">5G</option>
          </select>
        </Field>
        <Field label="المخزون *">
          <input type="number" min="0" className={inputCls} value={form.stock} onChange={(e) => set({ stock: e.target.value })} placeholder="0" required />
        </Field>
        <Field label="السعر ($) *">
          <input type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="0" required />
        </Field>
        <Field label="السعر قبل الخصم (اختياري)">
          <input type="number" min="0" step="0.01" className={inputCls} value={form.old_price} onChange={(e) => set({ old_price: e.target.value })} placeholder="0" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="وصف المنتج">
            <textarea rows={3} className={`${inputCls} resize-none`} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="وصف مختصر وجاذب للمنتج..." />
          </Field>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="font-extrabold text-ink sm:col-span-2 lg:col-span-4">المواصفات</h2>
        <Field label="الشاشة"><input className={inputCls} value={form.specs.screen} onChange={(e) => setSpec('screen', e.target.value)} placeholder={'6.3" OLED 120Hz'} /></Field>
        <Field label="المعالج"><input className={inputCls} value={form.specs.processor} onChange={(e) => setSpec('processor', e.target.value)} placeholder="A18 Pro" /></Field>
        <Field label="RAM"><input className={inputCls} value={form.specs.ram} onChange={(e) => setSpec('ram', e.target.value)} placeholder="8GB" /></Field>
        <Field label="التخزين"><input className={inputCls} value={form.specs.storage} onChange={(e) => setSpec('storage', e.target.value)} placeholder="256GB" /></Field>
        <Field label="الكاميرات"><input className={inputCls} value={form.specs.camera} onChange={(e) => setSpec('camera', e.target.value)} placeholder="48MP + 12MP" /></Field>
        <Field label="البطارية"><input className={inputCls} value={form.specs.battery} onChange={(e) => setSpec('battery', e.target.value)} placeholder="4400mAh" /></Field>
        <Field label="نظام التشغيل"><input className={inputCls} value={form.specs.os} onChange={(e) => setSpec('os', e.target.value)} placeholder="iOS 18" /></Field>
        <Field label="الألوان"><input className={inputCls} value={form.specs.colors} onChange={(e) => setSpec('colors', e.target.value)} placeholder="أسود، فضي" /></Field>
      </section>

      {used && (
        <section className="grid animate-fade-up gap-4 rounded-3xl border-2 border-ink/5 bg-white p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4">
          <h2 className="font-extrabold text-ink sm:col-span-2 lg:col-span-4">♻️ حالة الجهاز المستعمل</h2>
          <Field label="الحالة العامة *">
            <select className={inputCls} value={form.used_details.overall_condition} onChange={(e) => setUsed('overall_condition', e.target.value)}>
              <option>ممتازة</option>
              <option>جيدة جدًا</option>
              <option>جيدة</option>
            </select>
          </Field>
          <Field label="صحة البطارية (%) *"><input type="number" min="0" max="100" className={inputCls} value={form.used_details.battery_health} onChange={(e) => setUsed('battery_health', e.target.value)} placeholder="92" /></Field>
          <Field label="حالة الشاشة">
            <select className={inputCls} value={form.used_details.screen_condition} onChange={(e) => setUsed('screen_condition', e.target.value)}>
              <option value=""></option>
              <option>ممتازة</option>
              <option>جيدة جدًا</option>
              <option>آثار استخدام</option>
            </select>
          </Field>
          <Field label="حالة الهيكل">
            <select className={inputCls} value={form.used_details.body_condition} onChange={(e) => setUsed('body_condition', e.target.value)}>
              <option value=""></option>
              <option>ممتاز</option>
              <option>آثار استخدام بسيطة</option>
              <option>خدوش</option>
            </select>
          </Field>
          <Field label="الكاميرات"><input className={inputCls} value={form.used_details.cameras} onChange={(e) => setUsed('cameras', e.target.value)} placeholder="تعمل بشكل سليم" /></Field>
          <Field label="Face ID / البصمة">
            <select className={inputCls} value={form.used_details.face_id} onChange={(e) => setUsed('face_id', e.target.value)}>
              <option value=""></option>
              <option>تعمل</option>
              <option>لا تعمل</option>
            </select>
          </Field>
          <Field label="السماعات"><input className={inputCls} value={form.used_details.speakers} onChange={(e) => setUsed('speakers', e.target.value)} placeholder="تعمل بشكل سليم" /></Field>
          <Field label="منفذ الشحن"><input className={inputCls} value={form.used_details.port} onChange={(e) => setUsed('port', e.target.value)} placeholder="USB-C سليم" /></Field>
          <Field label="الشحن"><input className={inputCls} value={form.used_details.charging} onChange={(e) => setUsed('charging', e.target.value)} placeholder="يعمل بشكل سليم" /></Field>
          <Field label="الملحقات المرفقة"><input className={inputCls} value={form.used_details.accessories} onChange={(e) => setUsed('accessories', e.target.value)} placeholder="الجهاز + الشاحن + الكابل" /></Field>
          <Field label="الضمان"><input className={inputCls} value={form.used_details.warranty} onChange={(e) => setUsed('warranty', e.target.value)} placeholder="ضمان متجر شهر" /></Field>
          <Field label="مدة الاستخدام"><input className={inputCls} value={form.used_details.usage_duration} onChange={(e) => setUsed('usage_duration', e.target.value)} placeholder="8 أشهر" /></Field>
          <div className="sm:col-span-2 lg:col-span-4">
            <Field label="ملاحظات إضافية"><textarea rows={2} className={`${inputCls} resize-none`} value={form.used_details.notes} onChange={(e) => setUsed('notes', e.target.value)} placeholder="أي تفاصيل أخرى عن حالة الجهاز..." /></Field>
          </div>
        </section>
      )}

      <label className="flex w-fit items-center gap-2 text-sm font-bold text-ink">
        <input type="checkbox" checked={form.is_active} onChange={(e) => set({ is_active: e.target.checked })} className="size-4 accent-[#09090B]" />
        المنتج معروض في المتجر
      </label>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95 disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
      </button>
    </form>
  )
}
