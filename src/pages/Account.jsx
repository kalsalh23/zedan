import { Link, useNavigate } from 'react-router-dom'
import { Package, Heart, MapPin, MessageCircle, LogOut, ChevronLeft, ShieldCheck, UserCircle2, Phone, Mail, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/AppContext'
import { useTitle } from '../lib/hooks'
import { whatsappLink } from '../lib/format'
import { WHATSAPP_DISPLAY, STORE_PHONE, STORE_EMAIL } from '../lib/constants'
import { Confirm } from '../components/UI'
import { useEffect, useState } from 'react'
import Login from './Login'

export default function Account() {
  useTitle('حسابي')
  const { user, isAdmin, profile } = useApp()
  const [confirmOut, setConfirmOut] = useState(false)
  const [installEvt, setInstallEvt] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setInstallEvt(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!user) return <Login />

  const displayName = user.user_metadata?.full_name || profile.name || user.email?.split('@')[0]
  const rows = [
    { to: '/orders', icon: Package, label: 'طلباتي', desc: 'سجل جميع طلباتك' },
    { to: '/favorites', icon: Heart, label: 'المفضلة', desc: 'المنتجات المحفوظة' },
    { to: '/addresses', icon: MapPin, label: 'العناوين', desc: 'عناوين التوصيل المحفوظة' },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-4xl bg-ink p-8 text-center text-white shadow-soft">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent shadow-glow">
          <UserCircle2 className="size-11" />
        </span>
        <h1 className="mt-3 text-xl font-extrabold">{displayName}</h1>
        <p className="text-sm text-silver-400">{user.email}</p>
      </div>

      <div className="mt-5 space-y-3">
        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-4 rounded-2xl bg-accent-soft p-4 shadow-card transition hover:shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-white">
              <ShieldCheck className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-extrabold text-accent">لوحة تحكم الإدارة</span>
              <span className="block text-xs text-silver-500">إدارة المنتجات والطلبات والعروض</span>
            </span>
            <ChevronLeft className="size-5 text-silver-400" />
          </Link>
        )}

        {rows.map((r) => (
          <Link key={r.to} to={r.to} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition hover:shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-xl bg-paper text-accent">
              <r.icon className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-extrabold text-ink">{r.label}</span>
              <span className="block text-xs text-silver-400">{r.desc}</span>
            </span>
            <ChevronLeft className="size-5 text-silver-400" />
          </Link>
        ))}

        {installEvt && (
          <button
            onClick={() => installEvt.prompt()}
            className="flex w-full items-center gap-4 rounded-2xl bg-accent-soft p-4 text-right shadow-card transition hover:shadow-soft"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-white">
              <Download className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-extrabold text-accent">ثبّت Mobily Bro كتطبيق على جهازك</span>
              <span className="block text-xs text-silver-500">أيقونة على الشاشة الرئيسية وفتح أسرع كالتطبيقات</span>
            </span>
            <ChevronLeft className="size-5 text-silver-400" />
          </button>
        )}

        <a
          href={whatsappLink('مرحبًا، أحتاج دعمًا بخصوص طلبي 🙏')}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition hover:shadow-soft"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-paper text-wa">
            <MessageCircle className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold text-ink">الدعم عبر واتساب</span>
            <span className="block text-xs text-silver-400" dir="ltr">{WHATSAPP_DISPLAY}</span>
          </span>
          <ChevronLeft className="size-5 text-silver-400" />
        </a>

        <a
          href={`tel:${STORE_PHONE}`}
          className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition hover:shadow-soft"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-paper text-accent">
            <Phone className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold text-ink">اتصال هاتفي</span>
            <span className="block text-xs text-silver-400" dir="ltr">{STORE_PHONE}</span>
          </span>
          <ChevronLeft className="size-5 text-silver-400" />
        </a>

        <a
          href={`mailto:${STORE_EMAIL}`}
          className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition hover:shadow-soft"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-paper text-flame">
            <Mail className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold text-ink">البريد الإلكتروني</span>
            <span className="block text-xs text-silver-400" dir="ltr">{STORE_EMAIL}</span>
          </span>
          <ChevronLeft className="size-5 text-silver-400" />
        </a>

        <button
          onClick={() => setConfirmOut(true)}
          className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-right shadow-card transition hover:shadow-soft"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <LogOut className="size-5" />
          </span>
          <span className="flex-1 font-extrabold text-red-500">تسجيل الخروج</span>
        </button>
      </div>

      <Confirm
        open={confirmOut}
        title="تسجيل الخروج"
        desc="هل تريد بالتأكيد تسجيل الخروج من حسابك؟"
        confirmText="خروج"
        onCancel={() => setConfirmOut(false)}
        onConfirm={async () => {
          setConfirmOut(false)
          await supabase.auth.signOut()
          navigate('/')
        }}
      />
    </div>
  )
}
