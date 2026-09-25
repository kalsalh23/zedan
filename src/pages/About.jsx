import { Link } from 'react-router-dom'
import { MessageCircle, Phone, Mail, Facebook, Instagram, Sparkles, ShieldCheck, Truck, Recycle, BadgeCheck, ArrowLeft } from 'lucide-react'
import { OWNER, DEVELOPER } from '../lib/about'
import { useTitle } from '../lib/hooks'
import { whatsappLink } from '../lib/format'

const ICONS = {
  whatsapp: MessageCircle,
  phone: Phone,
  email: Mail,
  facebook: Facebook,
  instagram: Instagram,
}

function AccountChip({ account, dark = false }) {
  const Icon = ICONS[account.icon] || Mail
  return (
    <a
      href={account.href}
      target={account.href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className={`flex items-center gap-3 rounded-2xl p-3.5 transition active:scale-[0.98] ${
        dark
          ? 'bg-white/10 hover:bg-white/20'
          : 'bg-paper hover:bg-silver-100'
      }`}
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
        dark ? 'bg-white text-ink' : 'bg-ink text-white'
      } ${account.icon === 'whatsapp' ? '!bg-wa !text-white' : ''} ${account.icon === 'instagram' && dark ? '!bg-gradient-to-tr !from-[#F58529] !via-[#DD2A7B] !to-[#8134AF] !text-white' : ''} ${account.icon === 'facebook' && dark ? '!bg-[#1877F2] !text-white' : ''}`}>
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-xs font-bold ${dark ? 'text-silver-300' : 'text-silver-500'}`}>{account.label}</span>
        <span className={`block truncate text-sm font-extrabold ${dark ? 'text-white' : 'text-ink'}`} dir={account.icon === 'phone' || account.icon === 'whatsapp' || account.icon === 'email' ? 'ltr' : undefined}>
          {account.value}
        </span>
      </span>
    </a>
  )
}

export default function About() {
  useTitle('من نحن')
  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-6">
      {/* شرح المتجر */}
      <section className="relative overflow-hidden rounded-4xl bg-ink p-6 text-white shadow-soft md:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-white/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 size-56 rounded-full bg-flame/20 blur-[80px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold text-silver-300">
            <Sparkles className="size-3" /> من نحن
          </span>
          <h1 className="mt-3 text-xl font-extrabold md:text-3xl">
            Mobily Bro — <span className="text-silver-300">موبايلي برو</span>
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-silver-300 md:text-base">
            متجر متخصص بعالم الهواتف الذكية والإكسسوارات. نوفر أحدث الهواتف الجديدة بضمان المتجر، وأجهزة مستعملة مفحوصة بعناية وحالة موثّقة بالتفصيل — مع إكسسوارات أصلية وشحن تطبيقات وألعاب.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold md:grid-cols-4 md:text-xs">
            {[
              { icon: BadgeCheck, label: 'أجهزة أصلية مفحوصة' },
              { icon: Recycle, label: 'مستعمل بحالة موثّقة' },
              { icon: Truck, label: 'توصيل أو استلام من المحل' },
              { icon: ShieldCheck, label: 'طلب سريع عبر واتساب' },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2.5">
                <f.icon className="size-3.5 shrink-0 text-white" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* صاحب المتجر */}
      <section className="rounded-4xl bg-white p-6 shadow-card md:p-8">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-ink text-2xl font-extrabold text-white">
            {OWNER.initial}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-ink">{OWNER.name}</h2>
            <p className="text-sm font-bold text-silver-500">{OWNER.role}</p>
          </div>
        </div>
        {OWNER.bio && <p className="mt-4 text-sm leading-relaxed text-silver-500">{OWNER.bio}</p>}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {OWNER.accounts.map((a) => (
            <AccountChip key={a.label} account={a} />
          ))}
        </div>
      </section>

      {/* بطاقة المطور المميزة */}
      <section className="relative overflow-hidden rounded-4xl bg-ink p-8 text-white shadow-soft md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-flame/25 blur-[70px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 size-52 rounded-full bg-white/10 blur-[70px]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-flame px-4 py-1.5 text-xs font-extrabold text-white">
              <Sparkles className="size-3.5" /> بطاقة مميزة
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold text-silver-300">Developer</span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-ink">
              {DEVELOPER.initial}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-silver-300">{DEVELOPER.role}</p>
              <h2 className="text-xl font-extrabold md:text-2xl">{DEVELOPER.name}</h2>
            </div>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-silver-300">{DEVELOPER.tagline}</p>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {DEVELOPER.accounts.map((a) => (
              <AccountChip key={a.label} account={a} dark />
            ))}
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-silver-400">
        هل لديك سؤال؟ <a href={whatsappLink('مرحبًا 👋')} target="_blank" rel="noreferrer" className="font-bold text-ink underline underline-offset-4">راسلنا على واتساب</a> أو <Link to="/shop" className="inline-flex items-center gap-1 font-bold text-ink underline underline-offset-4">تصفح المتجر <ArrowLeft className="size-3" /></Link>
      </p>
    </div>
  )
}
