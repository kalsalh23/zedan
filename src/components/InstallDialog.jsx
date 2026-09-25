import { useEffect, useState } from 'react'
import { X, Download, Smartphone, Bell, Zap, Share2, PlusSquare } from 'lucide-react'
import { useApp } from '../store/AppContext'
import {
  getInstallPrompt, onInstallAvailability, isStandalone, isIOS,
  requestInstall, markDismissed, dismissedRecently, isInstalled,
} from '../lib/install'

export default function InstallDialog() {
  const { toast } = useApp()
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const maybeShow = () => {
      if (isStandalone() || isInstalled() || dismissedRecently()) return
      setIos(isIOS())
      if (getInstallPrompt() || isIOS()) {
        const t = setTimeout(() => setShow(true), 3500)
        return () => clearTimeout(t)
      }
    }
    const cleanup = maybeShow()
    const unsub = onInstallAvailability((available) => {
      if (available && !isStandalone() && !isInstalled() && !dismissedRecently()) {
        setIos(isIOS())
        setTimeout(() => setShow(true), 2000)
      }
    })
    return () => {
      if (cleanup) cleanup()
      unsub()
    }
  }, [])

  if (!show || isStandalone()) return null

  const close = () => {
    markDismissed()
    setShow(false)
  }

  const install = async () => {
    setBusy(true)
    const res = await requestInstall()
    setBusy(false)
    if (res === 'accepted') {
      toast('تم التثبيت — تجد Mobily Bro على شاشتك الرئيسية 📱')
      setShow(false)
    } else if (res === 'dismissed') {
      close()
    } else {
      // no native prompt (iOS or unsupported browser) → keep dialog open on iOS instructions
      if (!isIOS()) {
        toast('التثبيت غير مدعوم في هذا المتصفح — استخدم قائمة المتصفح «إضافة إلى الشاشة الرئيسية»', 'error')
        close()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[92] flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4" onClick={close}>
      <div
        className="w-full max-w-md animate-slide-in rounded-t-4xl bg-white p-6 shadow-soft md:rounded-4xl md:pb-6"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-192.png" alt="Mobily Bro" className="size-14 rounded-2xl shadow-card" />
            <div>
              <h2 className="text-lg font-extrabold text-ink">ثبّت تطبيق Mobily Bro</h2>
              <p className="text-xs font-bold text-silver-400">مجانًا — بحجم أقل من 1 ميغا</p>
            </div>
          </div>
          <button onClick={close} className="flex size-9 items-center justify-center rounded-full bg-paper text-ink" aria-label="إغلاق">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {[
            { icon: Zap, t: 'يفتح بملء الشاشة كأي تطبيق — أسرع بكثير' },
            { icon: Bell, t: 'إشعارات خارجية تصلك حتى والتطبيق مغلق' },
            { icon: Smartphone, t: 'أيقونة على شاشتك الرئيسية واختصارات سريعة' },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
              <f.icon className="size-4.5 shrink-0 text-ink" />
              <span className="text-xs font-bold text-ink">{f.t}</span>
            </div>
          ))}
        </div>

        {ios ? (
          <>
            <div className="mt-4 rounded-2xl border border-silver-200 p-4">
              <p className="mb-2.5 text-xs font-extrabold text-ink">للتثبيت على آيفون:</p>
              <ol className="space-y-1.5 text-xs font-bold leading-relaxed text-silver-500">
                <li className="flex items-center gap-2">1. اضغط زر المشاركة <Share2 className="size-3.5 text-ink" /> أسفل شريط سفاري</li>
                <li className="flex items-center gap-2">2. اختر «إضافة إلى الشاشة الرئيسية» <PlusSquare className="size-3.5 text-ink" /></li>
                <li>3. اضغط «إضافة» — وستجد الأيقونة على شاشتك</li>
              </ol>
            </div>
            <button onClick={close} className="mt-3 w-full rounded-full bg-paper py-3 text-sm font-bold text-ink active:scale-95">
              فهمت
            </button>
          </>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              onClick={install}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-extrabold text-white transition hover:bg-ink-800 active:scale-95 disabled:opacity-60"
            >
              <Download className="size-4" /> تثبيت الآن
            </button>
            <button onClick={close} className="rounded-full bg-paper px-6 py-3.5 text-sm font-bold text-ink active:scale-95">
              لاحقًا
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
