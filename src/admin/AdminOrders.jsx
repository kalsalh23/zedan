import { useEffect, useMemo, useState } from 'react'
import { Loader2, Phone, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'
import { formatPrice, statusInfo, fulfillmentInfo, formatDate } from '../lib/format'
import { EmptyState } from '../components/UI'

const STATUSES = ['new', 'preparing', 'ready', 'delivered']

export default function AdminOrders() {
  useTitle('إدارة الطلبات')
  const { toast } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  )

  const setStatus = async (order, status) => {
    setUpdating(order.id)
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id)
    setUpdating(null)
    if (error) return toast('تعذر تحديث الحالة', 'error')
    setOrders((l) => l.map((o) => (o.id === order.id ? { ...o, status } : o)))
    toast('تم تحديث حالة الطلب ✅')
  }

  const counts = useMemo(() => {
    const c = { all: orders.length }
    for (const s of STATUSES) c[s] = orders.filter((o) => o.status === s).length
    return c
  }, [orders])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-accent" /></div>

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-ink">الطلبات</h1>
      <p className="mb-4 text-sm text-silver-500">إدارة الطلبات وتحديث حالتها</p>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {[{ v: 'all', label: 'الكل' }, ...STATUSES.map((s) => ({ v: s, label: statusInfo(s).label }))].map((t) => (
          <button
            key={t.v}
            onClick={() => setFilter(t.v)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              filter === t.v ? 'bg-accent text-white shadow-glow' : 'bg-white text-ink shadow-card'
            }`}
          >
            {t.label} ({counts[t.v] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="لا توجد طلبات" desc="ستظهر طلبات العملاء هنا فور وصولها." />
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const st = statusInfo(o.status)
            const items = o.order_items || []
            return (
              <div key={o.id} className="rounded-3xl bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-ink">{o.customer_name} <span className="text-xs font-bold text-silver-400">#{o.order_number}</span></p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-silver-500" dir="ltr">
                      <Phone className="size-3" /> {o.phone}
                    </p>
                    <p className="text-xs text-silver-400">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {updating === o.id ? (
                      <Loader2 className="size-5 animate-spin text-accent" />
                    ) : (
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o, e.target.value)}
                        className={`rounded-full px-3 py-2 text-xs font-bold outline-none ${st.color}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{statusInfo(s).label}</option>
                        ))}
                      </select>
                    )}
                    <span className="text-lg font-extrabold text-ink">{formatPrice(o.total)}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 rounded-2xl bg-paper p-3.5">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <span className="font-bold text-ink">{it.product_name} <span className="text-silver-400">× {it.qty}</span></span>
                      <span className="font-bold text-silver-500">{formatPrice(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-bold text-silver-500">
                  <span>{fulfillmentInfo(o.fulfillment).emoji} {fulfillmentInfo(o.fulfillment).label}</span>
                  {o.fulfillment === 'delivery' && o.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {o.city} — {o.area} — {o.address}
                    </span>
                  )}
                  {o.notes && <span>📝 {o.notes}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
