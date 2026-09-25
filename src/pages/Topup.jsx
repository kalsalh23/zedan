import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Search, Zap, ChevronRight, Coins, Send, ShieldCheck } from 'lucide-react'
import { TOPUP_CATEGORIES, TOPUP_SERVICES, topupServiceLink } from '../lib/topup'
import { useTitle } from '../lib/hooks'

const CAT_NAME = Object.fromEntries(TOPUP_CATEGORIES.map((c) => [c.slug, c.name]))

function ServiceCard({ s, onOpen }) {
  const min = Math.min(...s.packages.filter((x) => x.$ !== null).map((x) => x.$))
  return (
    <button
      onClick={() => onOpen(s)}
      className="flex flex-col rounded-2xl bg-white p-3 text-right shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft active:scale-[0.98]"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-paper text-xl">{s.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-[13px] font-extrabold text-ink">{s.name}</h3>
          <p className="text-[10px] font-bold text-silver-400">
            {s.packages.length} باقة · يبدأ من {min}$
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-silver-300" />
      </div>
    </button>
  )
}

export default function Topup() {
  useTitle('شحن التطبيقات والألعاب')
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [service, setService] = useState(null)

  const services = useMemo(() => {
    let list = TOPUP_SERVICES
    if (cat !== 'all') list = list.filter((s) => s.cat === cat)
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(t) || s.packages.some((x) => x.p.toLowerCase().includes(t)))
    }
    return list
  }, [cat, q])

  const totalPackages = TOPUP_SERVICES.reduce((s, x) => s + x.packages.length, 0)

  // ------- صفحة تفاصيل خدمة -------
  if (service) {
    return (
      <div className="animate-fade-up">
        <button
          onClick={() => setService(null)}
          className="mb-4 flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-card active:scale-95"
        >
          <ChevronRight className="size-4" /> كل الخدمات
        </button>

        <div className="mb-5 flex items-center gap-4 rounded-3xl bg-ink p-5 text-white shadow-soft">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">{service.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold md:text-xl">{service.name}</h1>
            <p className="text-xs font-bold text-silver-300">{service.packages.length} باقة متوفرة · الدفع عبر USDT 💰</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {service.packages.map((pkg) => (
            <div key={pkg.p} className="flex flex-col rounded-2xl bg-white p-3.5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <p className="text-[13px] font-extrabold leading-snug text-ink">{pkg.p}</p>
              {pkg.$ !== null ? (
                <span className="mt-2 w-fit rounded-full bg-ink px-3 py-1 text-[12px] font-extrabold text-white">{pkg.$}$</span>
              ) : (
                <span className="mt-2 w-fit rounded-full bg-paper px-3 py-1 text-[11px] font-bold text-silver-500">حسب المبلغ</span>
              )}
              <a
                href={topupServiceLink(service, pkg)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-wa py-2.5 text-[11px] font-bold text-white transition hover:brightness-95 active:scale-95"
              >
                <MessageCircle className="size-3.5" />
                اطلب الآن
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-3xl bg-white p-5 text-center text-xs font-bold leading-relaxed text-silver-500 shadow-card">
          💰 تُرسل تفاصيل محفظة USDT لك عبر واتساب عند تأكيد الطلب — التسليم خلال دقائق بعد الدفع.
        </p>
      </div>
    )
  }

  // ------- القائمة الرئيسية -------
  return (
    <div className="animate-fade-up">
      {/* intro مدمج */}
      <section className="rounded-3xl bg-ink p-5 text-white shadow-soft md:p-7">
        <div className="flex items-center gap-4">
          <span className="text-3xl md:text-4xl">⚡</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold md:text-2xl">شحن تطبيقات وألعاب</h1>
            <p className="text-xs font-bold text-silver-300 md:text-sm">{totalPackages}+ باقة شحن بأسعار ثابتة</p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-flame px-3.5 py-1.5 text-[11px] font-extrabold md:block">تسليم سريع</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold md:text-xs">
          {[
            { icon: Coins, t: 'الدفع USDT' },
            { icon: Send, t: 'واتساب حصرًا' },
            { icon: ShieldCheck, t: 'مضمون وفوري' },
          ].map((f) => (
            <span key={f.t} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <f.icon className="size-3" /> {f.t}
            </span>
          ))}
        </div>
      </section>

      {/* search + tabs */}
      <section className="mt-5">
        <div className="mb-3 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card">
          <Search className="size-4 shrink-0 text-silver-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث: ببجي، فيفا، تيك توك، Netflix..."
            className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-silver-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ slug: 'all', name: 'الكل', emoji: '✨' }, ...TOPUP_CATEGORIES.map((c) => ({ ...c }))].map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                cat === c.slug ? 'bg-ink text-white shadow-glow' : 'bg-white text-ink shadow-card'
              }`}
            >
              <span>{c.emoji}</span> {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* services grid */}
      {services.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-white p-10 text-center text-sm font-bold text-silver-500 shadow-card">
          لا توجد نتائج — جرّب كلمة أخرى، أو راسلنا واتساب لأي شحن غير موجود.
        </p>
      ) : (
        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} onOpen={setService} />
          ))}
        </section>
      )}

      <p className="mt-8 rounded-3xl bg-white p-5 text-center text-xs font-bold leading-relaxed text-silver-500 shadow-card">
        💰 الدفع لجميع عمليات الشحن عبر <span className="text-ink">USDT</span> — تُرسل تفاصيل المحفظة عبر واتساب عند تأكيد الطلب.
        <br />
        💬 التواصل والطلب <span className="text-ink">واتساب حصرًا</span> — اضغط على أي خدمة لعرض باقاتها وأسعارها.
      </p>
    </div>
  )
}
