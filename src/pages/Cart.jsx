import { Link } from 'react-router-dom'
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useProductsByIds, useTitle, imgFallback } from '../lib/hooks'
import { formatPrice } from '../lib/format'
import { EmptyState, Spinner } from '../components/UI'

export default function Cart() {
  useTitle('سلة التسوق')
  const { cart, setQty, removeFromCart } = useApp()
  const { products, loading } = useProductsByIds(cart.map((i) => i.id))

  if (loading && cart.length) return <Spinner />

  if (!cart.length)
    return (
      <EmptyState
        icon={ShoppingCart}
        title="سلتك فارغة"
        desc="أضف منتجات إلى السلة لتتمكن من إرسال الطلب عبر واتساب."
        action={
          <Link to="/shop" className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95">
            ابدأ التسوق
          </Link>
        }
      />
    )

  const items = cart.map((i) => ({ ...i, product: products.find((p) => p.id === i.id) })).filter((i) => i.product)
  const total = items.reduce((s, i) => s + Number(i.product.price) * i.qty, 0)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink md:text-3xl">سلة التسوق 🛒</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map(({ product: p, qty, id }) => (
            <div key={id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-card">
              <Link to={`/product/${p.id}`} className="shrink-0">
                <img src={p.main_image} alt={p.name} onError={imgFallback} className="size-20 rounded-xl bg-paper object-contain p-1" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-silver-400">{p.brand}</p>
                <Link to={`/product/${p.id}`} className="line-clamp-1 text-sm font-extrabold text-ink hover:text-accent">{p.name}</Link>
                <p className="mt-0.5 text-xs font-bold text-silver-500">{formatPrice(p.price)} / قطعة</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full bg-paper p-1">
                    <button onClick={() => setQty(id, qty - 1)} className="flex size-7 items-center justify-center rounded-full bg-white text-ink shadow-card transition active:scale-90" aria-label="تقليل">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-extrabold text-ink">{qty}</span>
                    <button
                      onClick={() => setQty(id, Math.min(qty + 1, Number(p.stock) || 99))}
                      className="flex size-7 items-center justify-center rounded-full bg-white text-ink shadow-card transition active:scale-90"
                      aria-label="زيادة"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(id)} className="flex items-center gap-1 text-xs font-bold text-silver-400 transition hover:text-red-500">
                    <Trash2 className="size-3.5" /> حذف
                  </button>
                </div>
              </div>
              <span className="shrink-0 text-sm font-extrabold text-accent">{formatPrice(Number(p.price) * qty)}</span>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="mb-4 font-extrabold text-ink">ملخص الطلب</h2>
          <div className="flex justify-between border-b border-dashed border-silver-100 py-2 text-sm">
            <span className="text-silver-500">عدد القطع</span>
            <span className="font-bold text-ink">{items.reduce((s, i) => s + i.qty, 0)}</span>
          </div>
          <div className="flex justify-between py-3 text-base">
            <span className="font-bold text-silver-500">الإجمالي</span>
            <span className="text-xl font-extrabold text-accent">{formatPrice(total)}</span>
          </div>
          <p className="mb-4 rounded-xl bg-paper p-3 text-[11px] leading-relaxed text-silver-500">
            💡 لا يوجد دفع إلكتروني — سيتم إرسال طلبك عبر واتساب وتأكيده مع البائع مباشرة.
          </p>
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95"
          >
            متابعة الطلب <ArrowLeft className="size-4" />
          </Link>
        </aside>
      </div>
    </div>
  )
}
