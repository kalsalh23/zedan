import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellRing, Smartphone, Percent, CheckCheck, Info } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useTitle, imgFallback } from '../lib/hooks'
import { timeAgo } from '../lib/format'
import { EmptyState } from '../components/UI'

const TYPE_META = {
  product: { icon: Smartphone, label: 'منتج جديد' },
  offer: { icon: Percent, label: 'عرض وخصم' },
  general: { icon: Bell, label: 'إشعار' },
}

export default function Notifications() {
  useTitle('الإشعارات')
  const { notifications, unreadCount, markNotificationsSeen } = useApp()
  const [perm, setPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')

  const enableDeviceNotifications = async () => {
    if (typeof Notification === 'undefined') return
    try {
      const p = await Notification.requestPermission()
      setPerm(p)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">الإشعارات</h1>
          <p className="text-sm text-silver-500">أحدث ما وصل للمتجر من أجهزة وعروض</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markNotificationsSeen}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-white transition hover:bg-ink-800 active:scale-95"
          >
            <CheckCheck className="size-4" /> تحديد الكل كمقروء
          </button>
        )}
      </div>

      {perm === 'default' && (
        <button
          onClick={enableDeviceNotifications}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-ink p-4 text-right text-white shadow-soft transition hover:bg-ink-800"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-ink">
            <BellRing className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-extrabold">فعّل إشعارات الجهاز</span>
            <span className="block text-xs text-silver-300">ليصلك تنبيه فوري عند إضافة أجهزة جديدة أو عروض وخصومات</span>
          </span>
        </button>
      )}
      {perm === 'granted' && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-white p-3.5 text-xs font-bold text-silver-500 shadow-card">
          <BellRing className="size-4 text-emerald-500" /> إشعارات الجهاز مفعّلة — ستصلك التنبيهات الفورية
        </p>
      )}
      {perm === 'denied' && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-white p-3.5 text-xs font-bold leading-relaxed text-silver-500 shadow-card">
          <Info className="size-4 shrink-0 text-flame" />
          إشعارات الجهاز معطّلة من إعدادات المتصفح — يمكنك تفعيلها من إعدادات الموقع، وستبقى الإشعارات ظاهرة داخل التطبيق دائمًا.
        </p>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="لا توجد إشعارات بعد"
          desc="ستصلك هنا إشعارات وصول الأجهزة الجديدة والعروض والخصومات فور إضافتها."
          action={
            <Link to="/shop" className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white active:scale-95">
              تصفح المتجر
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.general
            const Icon = meta.icon
            const unread = n.created_at > (localStorage.getItem('mb_notif_seen') || '')
            const href = n.product_id ? `/product/${n.product_id}` : '/shop'
            return (
              <Link
                key={n.id}
                to={href}
                onClick={() => unread && null}
                className={`flex items-start gap-3.5 rounded-2xl p-4 shadow-card transition hover:shadow-soft ${
                  unread ? 'bg-white ring-1 ring-ink/10' : 'bg-white'
                }`}
              >
                {n.image_url ? (
                  <img src={n.image_url} alt="" loading="lazy" onError={imgFallback} className="size-12 shrink-0 rounded-xl bg-paper object-cover" />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-paper text-ink">
                    <Icon className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-silver-500">{meta.label}</span>
                    <span className="text-[11px] font-bold text-silver-400">{timeAgo(n.created_at)}</span>
                    {unread && <span className="size-2 shrink-0 rounded-full bg-flame" />}
                  </div>
                  <p className="mt-1 text-sm font-extrabold text-ink">{n.title}</p>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-silver-500">{n.body}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
