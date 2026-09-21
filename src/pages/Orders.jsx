import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'
import { formatPrice, statusInfo, fulfillmentInfo, formatDate } from '../lib/format'
import { EmptyState, Spinner, ErrorState } from '../components/UI'

function OrderCard({ order, items }) {
  const st = statusInfo(order.status)
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-ink">طلب #{order.order_number}</p>
          <p className="text-xs text-silver-400">{formatDate(order.created_at)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.color}`}>{st.label}</span>
      </div>
      <div className="mt-4 space-y-2 border-y border-dashed border-silver-100 py-3">
        {(items || []).map((it) => (
          <div key={it.id} className="flex justify-between text-sm">
            <span className="text-silver-500">{it.product_name} × {it.qty}</span>
            <span className="font-bold text-ink">{formatPrice(it.price * it.qty)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold text-silver-500">
          {fulfillmentInfo(order.fulfillment).emoji} {fulfillmentInfo(order.fulfillment).label}
          {order.fulfillment === 'delivery' && order.city ? ` — ${order.city} ${order.area || ''}` : ''}
        </span>
        <span className="text-lg font-extrabold text-accent">{formatPrice(order.total)}</span>
      </div>
    </div>
  )
}

export default function Orders() {
  useTitle('طلباتي')
  const { user, guestOrders } = useApp()
  const [orders, setOrders] = useState([])
  const [itemsMap, setItemsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    if (!user) {
      setOrders([])
      setItemsMap({})
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(true)
        else {
          const withItems = (data || []).map((o) => {
            const { order_items, ...rest } = o
            return { order: rest, items: order_items }
          })
          const map = {}
          withItems.forEach(({ order, items }) => (map[order.id] = items))
          setOrders(withItems.map((x) => ({ ...x.order, _items: x.items })))
          setItemsMap(map)
        }
        setLoading(false)
      }).catch(() => {
        if (!active) return
        setError(true)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  if (loading) return <Spinner />

  if (!user && guestOrders.length === 0)
    return (
      <EmptyState
        icon={Package}
        title="لا توجد طلبات بعد"
        desc="اطلب أول منتج لك وسيعرض هنا، أو سجّل دخولك لعرض طلباتك من أي جهاز."
        action={
          <div className="mt-2 flex gap-3">
            <Link to="/shop" className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-glow active:scale-95">تصفح المنتجات</Link>
            <Link to="/account" className="rounded-full bg-paper px-6 py-2.5 text-sm font-bold text-ink active:scale-95">تسجيل الدخول</Link>
          </div>
        }
      />
    )

  const dbOrders = orders.map((o) => ({ order: o, items: o._items, key: o.id }))
  const localOrders = guestOrders.map((g, i) => ({ order: g.order, items: g.items, key: `local-${i}` }))
  const all = [...dbOrders, ...localOrders]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink md:text-3xl">طلباتي</h1>
      {error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : all.length === 0 ? (
        <EmptyState icon={Package} title="لا توجد طلبات بعد" desc="ابدأ التسوق الآن وأرسل طلبك الأول عبر واتساب."
          action={<Link to="/shop" className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-glow">تصفح المنتجات</Link>} />
      ) : (
        <div className="space-y-4">
          {all.map(({ order, items, key }) => (
            <OrderCard key={key} order={order} items={items} />
          ))}
        </div>
      )}
      {!user && guestOrders.length > 0 && (
        <p className="mt-6 rounded-2xl bg-accent-soft p-4 text-center text-xs font-bold leading-relaxed text-accent">
          💡 هذه الطلبات محفوظة على هذا الجهاز — سجّل الدخول قبل الطلب لتظهر طلباتك في حسابك دائمًا.
        </p>
      )}
    </div>
  )
}
