import { useMemo, useState } from 'react'
import { MessageCircle, Search, Zap, ShieldCheck, Coins, Send } from 'lucide-react'
import { TOPUP_CATEGORIES, TOPUP_ITEMS, TOPUP_COUNT, topupOrderLink } from '../lib/topup'
import { useTitle } from '../lib/hooks'

const CAT_NAME = Object.fromEntries(TOPUP_CATEGORIES.map((c) => [c.slug, c.name]))

export default function Topup() {
  useTitle('شحن التطبيقات والألعاب')
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')

  const items = useMemo(() => {
    let list = TOPUP_CATEGORIES.flatMap((c) => TOPUP_ITEMS[c.slug].map(([name, emoji, price]) => ({ name, emoji, price, cat: c.slug })))
    if (cat !== 'all') list = list.filter((i) => i.cat === cat)
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      list = list.filter((i) => i.name.toLowerCase().includes(t))
    }
    return list
  }, [cat, q])

  return (
    <div className="animate-fade-up">
      {/* intro */}
      <section className="relative overflow-hidden rounded-4xl bg-ink p-7 text-white shadow-soft md:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-flame/25 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 size-56 rounded-full bg-white/10 blur-[80px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flame px-4 py-1.5 text-xs font-extrabold">
            <Zap className="size-3.5" /> خدمة شحن سريعة
          </span>
          <h1 className="mt-4 text-2xl font-extrabold md:text-4xl">شحن تطبيقات وألعاب ⚡</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-silver-300 md:text-base">
            نوفر شحن أكثر من {TOPUP_COUNT} لعبة وتطبيق وباقة واشتراك: شدات، جواهر، عملات، بطاقات هدايا، اشتراكات مميزة ومفاتيح — تسليم سريع بعد تأكيد الدفع.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2.5 text-xs font-bold sm:grid-cols-3">
            {[
              { icon: Coins, label: 'الدفع عبر USDT 💰' },
              { icon: Send, label: 'الطلب عبر واتساب حصرًا' },
              { icon: ShieldCheck, label: 'تسليم مضمون وفوري' },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
                <f.icon className="size-4 shrink-0 text-white" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* steps */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { n: '1', t: 'اختر اللعبة أو التطبيق', d: 'من القائمة أدناه' },
          { n: '2', t: 'راسلنا واتساب', d: 'حدّد الكمية أو المبلغ' },
          { n: '3', t: 'ادفع عبر USDT', d: 'واستلم شحنك فورًا' },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-white">
              {s.n}
            </span>
            <div>
              <p className="text-sm font-extrabold text-ink">{s.t}</p>
              <p className="text-xs text-silver-400">{s.d}</p>
            </div>
          </div>
        ))}
      </section>

      {/* search + filters */}
      <section className="mt-6">
        <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card">
          <Search className="size-4 shrink-0 text-silver-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن لعبة أو تطبيق... (ببجي، تيك توك، Netflix)"
            className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-silver-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ slug: 'all', name: `الكل (${TOPUP_COUNT})`, emoji: '✨' }, ...TOPUP_CATEGORIES.map((c) => ({
            slug: c.slug,
            name: `${c.name} (${TOPUP_ITEMS[c.slug].length})`,
            emoji: c.emoji,
          }))].map((c) => (
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

      {/* items grid */}
      {items.length === 0 ? (
        <p className="mt-10 rounded-3xl bg-white p-10 text-center text-sm font-bold text-silver-500 shadow-card">
          لا توجد نتائج — جرّب كلمة أخرى، أو راسلنا واتساب لأي شحن غير موجود في القائمة.
        </p>
      ) : (
        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((i) => (
            <div key={i.name} className="flex flex-col rounded-2xl bg-white p-3 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
              <div className="flex items-center gap-2.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-paper text-xl">{i.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-silver-400">{CAT_NAME[i.cat]}</p>
                  <h3 className="line-clamp-2 text-[13px] font-extrabold leading-snug text-ink">{i.name}</h3>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                {i.price ? (
                  <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-extrabold text-white">{i.price}$</span>
                ) : (
                  <span className="text-[10px] font-bold text-silver-400">حسب الكمية</span>
                )}
                <a
                  href={topupOrderLink(i.name, i.price)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-wa py-2 text-[11px] font-bold text-white transition hover:brightness-95 active:scale-95"
                >
                  <MessageCircle className="size-3.5" />
                  اطلب
                </a>
              </div>
            </div>
          ))}
        </section>
      )}

      <p className="mt-8 rounded-3xl bg-white p-5 text-center text-xs font-bold leading-relaxed text-silver-500 shadow-card">
        💰 الدفع لجميع عمليات الشحن عبر <span className="text-ink">USDT</span> — تُرسل تفاصيل المحفظة لك عبر واتساب عند تأكيد الطلب.
        <br />
        💬 التواصل والطلب <span className="text-ink">واتساب حصرًا</span> — الرد خلال دقائق خلال ساعات العمل.
      </p>
    </div>
  )
}
