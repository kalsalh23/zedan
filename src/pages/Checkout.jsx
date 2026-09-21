import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Store, Truck, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useProductsByIds, useTitle, imgFallback } from '../lib/hooks'
import { formatPrice, makeOrderNumber, buildWhatsAppMessage, whatsappLink } from '../lib/format'
import { EmptyState } from '../components/UI'

export default function Checkout() {
  useTitle('إتمام الطلب')
  const navigate = useNavigate()
  const { cart, profile, setProfile, user, clearCart, addGuestOrder, toast } = useApp()
  const { products, loading } = useProductsByIds(cart.map((i) => i.id))

  const [name, setName] = useState(profile.name || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [fulfillment, setFulfillment] = useState('pickup')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(null) // {link}

  const items = cart.map((i) => ({ ...i, product: products.find((p) => p.id === i.id) })).filter((i) => i.product)
  const total = items.reduce((s, i) => s + Number(i.product.price) * i.qty, 0)

  if (!cart.length && !done)
    return (
      <EmptyState
        icon={Store}
        title="لا توجد منتجات لإتمام الطلب"
        desc="أضف منتجات إلى السلة أولًا."
        action={
          <Link to="/shop" className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-glow active:scale-95">
            تصفح المنتجات
          </Link>
        }
      />
    )

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      toast('الرجاء إدخال الاسم ورقم الهاتف', 'error')
      return
    }
    if (fulfillment === 'delivery' && (!city.trim() || !area.trim() || !address.trim())) {
      toast('الرجاء إكمال بيانات العنوان', 'error')
      return
    }
    setSending(true)
    setProfile({ name: name.trim(), phone: phone.trim() })

    const order_number = makeOrderNumber()
    const order = {
      order_number,
      user_id: user?.id ?? null,
      customer_name: name.trim(),
      phone: phone.trim(),
      fulfillment,
      city: fulfillment === 'delivery' ? city.trim() : null,
      area: fulfillment === 'delivery' ? area.trim() : null,
      address: fulfillment === 'delivery' ? address.trim() : null,
      notes: notes.trim() || null,
      total,
      status: 'new',
    }
    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      product_name: i.product.name,
      price: Number(i.product.price),
      qty: i.qty,
    }))

    let saved = false
    try {
      const { data: inserted, error: err } = await supabase.from('orders').insert(order).select().single()
      if (err) throw err
      const { error: err2 } = await supabase.from('order_items').insert(orderItems.map((it) => ({ ...it, order_id: inserted.id })))
      if (err2) throw err2
      saved = true
    } catch {
      // WhatsApp remains the main channel — continue even if DB save fails
      toast('تعذر حفظ الطلب في النظام، سيتم إرساله عبر واتساب', 'error')
    }

    const message = buildWhatsAppMessage(order, orderItems)
    const link = whatsappLink(message)
    setDone({ link, order_number, saved })
    addGuestOrder(order, orderItems)
    clearCart()
    setSending(false)
    window.open(link, '_blank', 'noopener')
  }

  if (done)
    return (
      <div className="mx-auto max-w-md animate-slide-in rounded-4xl bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">تم إرسال طلبك! 🎉</h1>
        <p className="mt-2 text-sm leading-relaxed text-silver-500">
          رقم طلبك <span className="font-extrabold text-ink">{done.order_number}</span> — أكمل تأكيد الطلب عبر واتساب وسيرد عليك البائع بسرعة.
        </p>
        <a
          href={done.link}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-wa py-3.5 text-sm font-bold text-white transition hover:brightness-95 active:scale-95"
        >
          <MessageCircle className="size-4" /> فتح واتساب مرة أخرى
        </a>
        <div className="mt-3 flex gap-3">
          <button onClick={() => navigate('/orders')} className="flex-1 rounded-full bg-paper py-3 text-sm font-bold text-ink transition hover:bg-silver-100 active:scale-95">
            طلباتي
          </button>
          <button onClick={() => navigate('/shop')} className="flex-1 rounded-full bg-paper py-3 text-sm font-bold text-ink transition hover:bg-silver-100 active:scale-95">
            مواصلة التسوق
          </button>
        </div>
      </div>
    )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink md:text-3xl">إتمام الطلب</h1>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-3xl bg-white p-5 shadow-card">
            <h2 className="mb-4 font-extrabold text-ink">بيانات العميل</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-silver-500">الاسم الكامل *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="محمد أحمد"
                  className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-silver-500">رقم الهاتف *</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  inputMode="tel"
                  dir="ltr"
                  placeholder="09XX XXX XXX"
                  className="w-full rounded-xl border border-silver-200 px-4 py-3 text-right text-sm font-bold outline-none transition focus:border-accent"
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-card">
            <h2 className="mb-4 font-extrabold text-ink">طريقة الاستلام</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { v: 'pickup', icon: Store, title: 'استلام من المحل', desc: 'استلم طلبك من المتجر مباشرة' },
                { v: 'delivery', icon: Truck, title: 'توصيل إلى المنزل', desc: 'نوصل طلبك حتى باب بيتك' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => setFulfillment(opt.v)}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-right transition active:scale-[0.98] ${
                    fulfillment === opt.v ? 'border-accent bg-accent-soft' : 'border-silver-100 hover:border-silver-200'
                  }`}
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${fulfillment === opt.v ? 'bg-accent text-white' : 'bg-paper text-ink'}`}>
                    <opt.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-ink">{opt.title}</span>
                    <span className="block text-xs text-silver-400">{opt.desc}</span>
                  </span>
                </button>
              ))}
            </div>

            {fulfillment === 'delivery' && (
              <div className="mt-4 grid animate-fade-up gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-silver-500">المدينة *</span>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="دمشق" className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-accent" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-silver-500">المنطقة *</span>
                  <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="المزة" className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-accent" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-silver-500">العنوان بالتفصيل *</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="الشارع، البناء، الطابق..." className="w-full rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-accent" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-silver-500">ملاحظات (اختياري)</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="أي تفاصيل تساعد في التوصيل" className="w-full resize-none rounded-xl border border-silver-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-accent" />
                </label>
              </div>
            )}
            {fulfillment === 'pickup' && (
              <p className="mt-4 rounded-xl bg-paper p-3 text-xs font-bold leading-relaxed text-silver-500">
                🏪 يمكنك استلام طلبك من المحل خلال ساعات العمل — سنؤكد معك الموعد عبر واتساب.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="mb-4 font-extrabold text-ink">ملخص الطلب</h2>
          <div className="mb-3 max-h-60 space-y-3 overflow-y-auto">
            {items.map(({ product: p, qty }) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.main_image} alt={p.name} onError={imgFallback} className="size-12 rounded-lg bg-paper object-contain p-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-bold text-ink">{p.name}</p>
                  <p className="text-[11px] text-silver-400">× {qty}</p>
                </div>
                <span className="text-xs font-extrabold text-ink">{formatPrice(Number(p.price) * qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-silver-100 pt-3">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-silver-500">طريقة الاستلام</span>
              <span className="font-bold text-ink">{fulfillment === 'pickup' ? '🏪 استلام من المحل' : '🚚 توصيل للمنزل'}</span>
            </div>
            {fulfillment === 'delivery' && (city || area) && (
              <div className="flex justify-between py-1 text-sm">
                <span className="text-silver-500">العنوان</span>
                <span className="max-w-40 truncate font-bold text-ink">{city} - {area}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="font-bold text-silver-500">الإجمالي</span>
                <span className="text-xl font-extrabold text-ink">{formatPrice(total)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={sending || loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-wa py-3.5 text-sm font-bold text-white shadow-soft transition hover:brightness-95 active:scale-95 disabled:opacity-60"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
            إرسال الطلب عبر WhatsApp
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-silver-400">
            بالضغط على الزر سيُفتح واتساب برسالة طلبك جاهزة — لا يوجد دفع إلكتروني.
          </p>
        </aside>
      </form>
    </div>
  )
}
