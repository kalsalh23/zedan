import { NavLink } from 'react-router-dom'
import { Home, Store, Recycle, ShoppingCart, User } from 'lucide-react'
import { useApp } from '../store/AppContext'

const items = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/shop', label: 'المتجر', icon: Store },
  { to: '/used', label: 'المستعملة', icon: Recycle },
  { to: '/cart', label: 'السلة', icon: ShoppingCart, badge: true },
  { to: '/account', label: 'الحساب', icon: User },
]

export default function BottomNav() {
  const { cartCount } = useApp()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-silver-100 bg-white/95 backdrop-blur-md md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition ${isActive ? 'text-accent' : 'text-silver-400'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`relative rounded-full px-4 py-1 transition ${isActive ? 'bg-accent-soft' : ''}`}>
                  <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                  {badge && cartCount > 0 && (
                    <span className="absolute -top-1 -left-1 flex min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
