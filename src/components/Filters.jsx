import { useState } from 'react'
import { SlidersHorizontal, X, Check } from 'lucide-react'

const SORTS = [
  { v: 'newest', label: 'الأحدث' },
  { v: 'price_asc', label: 'السعر: من الأقل' },
  { v: 'price_desc', label: 'السعر: من الأعلى' },
]

export const defaultFilters = { brands: [], min: '', max: '', network: 'all', sort: 'newest' }

function Content({ brands, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const toggleBrand = (b) =>
    set({ brands: value.brands.includes(b) ? value.brands.filter((x) => x !== b) : [...value.brands, b] })

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-extrabold text-ink">الشركة</h4>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => {
            const active = value.brands.includes(b)
            return (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                  active ? 'border-accent bg-accent text-white' : 'border-silver-200 bg-white text-ink hover:border-silver-300'
                }`}
              >
                {active && <Check className="size-3" />}
                {b}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-extrabold text-ink">السعر</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="من"
            value={value.min}
            onChange={(e) => set({ min: e.target.value })}
            className="w-full rounded-xl border border-silver-200 bg-white px-3 py-2 text-sm font-bold text-ink outline-none transition focus:border-accent"
          />
          <span className="text-silver-400">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="إلى"
            value={value.max}
            onChange={(e) => set({ max: e.target.value })}
            className="w-full rounded-xl border border-silver-200 bg-white px-3 py-2 text-sm font-bold text-ink outline-none transition focus:border-accent"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-extrabold text-ink">الشبكة</h4>
        <div className="flex gap-2">
          {[
            { v: 'all', label: 'الكل' },
            { v: '4G', label: '4G' },
            { v: '5G', label: '5G' },
          ].map((n) => (
            <button
              key={n.v}
              onClick={() => set({ network: n.v })}
              className={`flex-1 rounded-full border py-2 text-xs font-bold transition active:scale-95 ${
                value.network === n.v ? 'border-accent bg-accent text-white' : 'border-silver-200 bg-white text-ink hover:border-silver-300'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-extrabold text-ink">الترتيب</h4>
        <select
          value={value.sort}
          onChange={(e) => set({ sort: e.target.value })}
          className="w-full rounded-xl border border-silver-200 bg-white px-3 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-accent"
        >
          {SORTS.map((s) => (
            <option key={s.v} value={s.v}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function Filters({ brands, value, onChange }) {
  const [open, setOpen] = useState(false)
  const activeCount = value.brands.length + (value.network !== 'all' ? 1 : 0) + (value.min || value.max ? 1 : 0)

  return (
    <>
      {/* mobile bar */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-card active:scale-95"
        >
          <SlidersHorizontal className="size-4 text-accent" />
          الفلاتر
          {activeCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] text-white">{activeCount}</span>}
        </button>
        <select
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value })}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-card outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.v} value={s.v}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* desktop sidebar */}
      <aside className="sticky top-24 hidden self-start rounded-3xl bg-white p-5 shadow-card lg:block">
        <h3 className="mb-5 flex items-center gap-2 font-extrabold text-ink">
          <SlidersHorizontal className="size-4 text-accent" /> الفلاتر
        </h3>
        <Content brands={brands} value={value} onChange={onChange} />
      </aside>

      {/* mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-[85] bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-slide-in overflow-y-auto rounded-t-4xl bg-white p-5 pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-extrabold text-ink">الفلاتر</h3>
              <button onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-full bg-paper">
                <X className="size-4" />
              </button>
            </div>
            <Content brands={brands} value={value} onChange={onChange} />
            <div className="fixed inset-x-0 bottom-0 border-t border-silver-100 bg-white p-4">
              <button onClick={() => setOpen(false)} className="w-full rounded-full bg-accent py-3 text-sm font-bold text-white shadow-glow active:scale-95">
                عرض النتائج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
