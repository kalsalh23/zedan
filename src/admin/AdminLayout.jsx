import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tags, Receipt, Percent, Store, Loader2, ShieldAlert, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'

const links = [
  { to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/categories', label: 'الأقسام', icon: Tags },
  { to: '/admin/orders', label: 'الطلبات', icon: Receipt },
  { to: '/admin/offers', label: 'العروض', icon: Percent },
]

export default function AdminLayout() {
  useTitle('لوحة التحكم')
  const { user, authReady, isAdmin } = useApp()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (authReady) setChecking(false)
  }, [authReady])

  if (checking)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-silver-500">
        <Loader2 className="size-8 animate-spin text-accent" />
        <span className="text-sm font-bold">جاري التحقق من الصلاحيات...</span>
      </div>
    )

  if (!user)
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-4xl bg-white p-10 text-center shadow-soft">
        <ShieldAlert className="size-12 text-accent" />
        <h1 className="mt-4 text-xl font-extrabold text-ink">منطقة محمية</h1>
        <p className="mt-2 text-sm text-silver-500">سجّل دخولك بحساب المدير للوصول إلى لوحة التحكم.</p>
        <button
          onClick={() => navigate('/account', { state: { next: '/admin' } })}
          className="mt-6 flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-bold text-white shadow-glow active:scale-95"
        >
          <LogIn className="size-4" /> تسجيل الدخول
        </button>
      </div>
    )

  if (!isAdmin)
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-4xl bg-white p-10 text-center shadow-soft">
        <ShieldAlert className="size-12 text-red-400" />
        <h1 className="mt-4 text-xl font-extrabold text-ink">غير مصرح</h1>
        <p className="mt-2 text-sm leading-relaxed text-silver-500">
          هذا الحساب لا يملك صلاحيات المدير. تواصل مع صاحب المتجر لإضافة حسابك إلى قائمة المديرين.
        </p>
        <Link to="/" className="mt-6 rounded-full bg-paper px-8 py-3 text-sm font-bold text-ink active:scale-95">
          العودة للمتجر
        </Link>
      </div>
    )

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-3xl bg-ink p-4 text-white shadow-soft">
          <p className="mb-3 hidden px-2 text-xs font-bold text-silver-400 lg:block">لوحة الإدارة</p>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                    isActive ? 'bg-accent text-white shadow-glow' : 'text-silver-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <l.icon className="size-4.5" />
                {l.label}
              </NavLink>
            ))}
            <NavLink
              to="/"
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-silver-300 transition hover:bg-white/10 hover:text-white"
            >
              <Store className="size-4.5" /> عرض المتجر
            </NavLink>
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
