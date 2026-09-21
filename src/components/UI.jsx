import { Loader2, PackageSearch, AlertTriangle, X, CheckCircle2 } from 'lucide-react'
import { useApp } from '../store/AppContext'

export function Spinner({ label = 'جاري التحميل...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-silver-500">
      <Loader2 className="size-8 animate-spin text-accent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-card">
      <div className="mb-3 aspect-square animate-shimmer rounded-xl bg-[linear-gradient(110deg,#F1F1F4_8%,#E7E7EC_18%,#F1F1F4_33%)] bg-[length:200%_100%]" />
      <div className="mb-2 h-4 w-3/4 animate-shimmer rounded-full bg-[linear-gradient(110deg,#F1F1F4_8%,#E7E7EC_18%,#F1F1F4_33%)] bg-[length:200%_100%]" />
      <div className="h-4 w-1/2 animate-shimmer rounded-full bg-[linear-gradient(110deg,#F1F1F4_8%,#E7E7EC_18%,#F1F1F4_33%)] bg-[length:200%_100%]" />
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon = PackageSearch, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 py-16 text-center shadow-card">
      <div className="flex size-16 items-center justify-center rounded-full bg-paper">
        <Icon className="size-8 text-silver-400" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {desc && <p className="max-w-sm text-sm leading-relaxed text-silver-500">{desc}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ title = 'عذرًا!', desc = 'حدث خطأ أثناء تحميل البيانات. تحقق من اتصالك وحاول مجددًا.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white px-6 py-16 text-center shadow-card">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="size-8 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-silver-500">{desc}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-1 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white transition hover:bg-ink-800 active:scale-95">
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}

export function Confirm({ open, title = 'تأكيد الحذف', desc, confirmText = 'حذف', onConfirm, onCancel, danger = true }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm animate-slide-in rounded-3xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-lg font-bold text-ink">{title}</h3>
        {desc && <p className="mb-5 text-sm leading-relaxed text-silver-500">{desc}</p>}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold text-white transition active:scale-95 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent-dark'}`}
          >
            {confirmText}
          </button>
          <button onClick={onCancel} className="flex-1 rounded-full bg-paper py-2.5 text-sm font-bold text-ink transition hover:bg-silver-100 active:scale-95">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex max-w-sm animate-slide-in items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-soft ${
            t.type === 'error' ? 'bg-red-500 text-white' : 'bg-ink text-white'
          }`}
        >
          {t.type === 'error' ? <X className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold text-ink md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-silver-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
