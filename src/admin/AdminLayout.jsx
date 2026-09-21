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

function Guard({ children }) {
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
      <div className="mx-auto flex max-w-md flex-col items-center rounded-4xl bg-white p-8 text-center shadow-soft md:p-10">
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
      <div className="mx-auto flex max-w-md flex-col items-center rounded-4xl bg-white p-8 text-center shadow-soft md:p-10">
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

  return children
}

export default function AdminLayout() {
  useTitle('لوحة التحكم')
  return (
    <Guard>
      {/* Mobile: sticky tabs bar */}
      <div className="sticky top-16 z-40 -mx-4 border-b border-silver-100 bg-paper/95 px-4 py-2.5 backdrop-blur md:top-16 lg:hidden">
        <nav className="flex gap-2 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                  isActive ? 'bg-accent text-white shadow-glow' : 'bg-white text-ink shadow-card'
                }`
              }
            >
              <l.icon className="size-3.5" />
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-accent shadow-card"
          >
            <Store className="size-3.5" /> المتجر
          </NavLink>
        </nav>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
          <div className="rounded-3xl bg-ink p-4 text-white shadow-soft">
            <p className="mb-3 px-2 text-xs font-bold text-silver-400">لوحة الإدارة</p>
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
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
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-silver-300 transition hover:bg-white/10 hover:text-white"
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
    </Guard>
  )
}
