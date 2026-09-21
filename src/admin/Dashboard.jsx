import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Smartphone, Recycle, CheckCircle2, AlertTriangle, Receipt, DollarSign, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatPrice, statusInfo, formatDate } from '../lib/format'
import { Spinner, ErrorState } from '../components/UI'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const count = (q) => q.then(({ count }) => count)
    Promise.all([
      count(supabase.from('products').select('id', { count: 'exact', head: true })),
      count(supabase.from('products').select('id', { count: 'exact', head: true }).eq('condition', 'new')),
      count(supabase.from('products').select('id', { count: 'exact', head: true }).eq('condition', 'used')),
      count(supabase.from('products').select('id', { count: 'exact', head: true }).gt('stock', 0)),
      count(supabase.from('products').select('id', { count: 'exact', head: true }).lte('stock', 3).gt('stock', 0)),
      count(supabase.from('orders').select('id', { count: 'exact', head: true })),
      supabase.from('orders').select('total'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    ])
      .then(([totalP, newP, usedP, availableP, lowP, ordersC, totals, recentO]) => {
        if (!active) return
        const sales = (totals.data || []).reduce((s, o) => s + Number(o.total), 0)
        setStats({
          totalProducts: totalP,
          newProducts: newP,
          usedProducts: usedP,
          available: availableP,
          lowStock: lowP,
          orders: ordersC,
          sales,
        })
        setRecent(recentO.data || [])
        setLoading(false)
      })
      .catch(() => {
        if (active) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorState onRetry={() => window.location.reload()} />

  const cards = [
    { label: 'إجمالي المنتجات', value: stats.totalProducts, icon: Package, bg: 'bg-accent-soft', fg: 'text-accent' },
    { label: 'منتجات جديدة', value: stats.newProducts, icon: Smartphone, bg: 'bg-paper', fg: 'text-ink' },
    { label: 'أجهزة مستعملة', value: stats.usedProducts, icon: Recycle, bg: 'bg-paper', fg: 'text-ink' },
    { label: 'منتجات متوفرة', value: stats.available, icon: CheckCircle2, bg: 'bg-emerald-50', fg: 'text-emerald-500' },
    { label: 'مخزون منخفض', value: stats.lowStock, icon: AlertTriangle, bg: 'bg-amber-50', fg: 'text-amber-500' },
    { label: 'عدد الطلبات', value: stats.orders, icon: Receipt, bg: 'bg-sky-50', fg: 'text-sky-500' },
    { label: 'إجمالي المبيعات', value: formatPrice(stats.sales), icon: DollarSign, bg: 'bg-accent text-white', fg: 'text-white', dark: true },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">لوحة التحكم</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl p-4 shadow-card ${c.dark ? 'bg-ink text-white' : 'bg-white'}`}>
            <span className={`mb-3 flex size-9 items-center justify-center rounded-xl ${c.bg} ${c.fg}`}>
              <c.icon className="size-4.5" />
            </span>
            <p className={`text-xl font-extrabold md:text-2xl ${c.dark ? 'text-white' : 'text-ink'}`}>{c.value}</p>
            <p className={`mt-0.5 text-[11px] font-bold md:text-xs ${c.dark ? 'text-silver-300' : 'text-silver-500'}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-extrabold text-ink">أحدث الطلبات</h2>
          <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-accent">
            الكل <ChevronLeft className="size-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-silver-400">لا توجد طلبات بعد</p>
        ) : (
          <div className="space-y-3">
            {recent.map((o) => {
              const st = statusInfo(o.status)
              return (
                <Link to="/admin/orders" key={o.id} className="flex items-center justify-between gap-3 rounded-2xl bg-paper p-3.5 transition hover:bg-silver-100">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-ink">{o.customer_name} <span className="text-xs font-bold text-silver-400">#{o.order_number}</span></p>
                    <p className="text-xs text-silver-400">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${st.color}`}>{st.label}</span>
                    <span className="text-sm font-extrabold text-ink">{formatPrice(o.total)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
