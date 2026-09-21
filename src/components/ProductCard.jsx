import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, GitCompare, BatteryFull, Recycle, Signal } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatPrice, isAvailable } from '../lib/format'
import { imgFallback } from '../lib/hooks'

const img = (p) => p.main_image || (p.product_images?.[0]?.url ?? '')

export default function ProductCard({ product }) {
  const { addToCart, toggleFav, inFav, toggleCompare, inCompare } = useApp()
  const p = product
  const used = p.condition === 'used'
  const available = isAvailable(p)
  const usedDetails = p.used_details || {}

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white p-2.5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <button
        onClick={() => toggleFav(p.id)}
        aria-label="المفضلة"
        className={`absolute left-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full backdrop-blur transition active:scale-90 ${
          inFav(p.id) ? 'bg-ink text-white' : 'bg-paper/90 text-ink hover:text-ink-600'
        }`}
      >
        <Heart className={`size-3.5 ${inFav(p.id) ? 'fill-current animate-pop' : ''}`} />
      </button>

      <Link to={`/product/${p.id}`} className="relative block overflow-hidden rounded-xl bg-paper">
        <img
          src={img(p)}
          alt={p.name}
          loading="lazy"
          onError={imgFallback}
          className="aspect-square w-full object-contain p-2 transition duration-300 group-hover:scale-105"
        />
        <div className="absolute right-1.5 top-1.5 flex flex-col gap-1">
          {used ? (
            <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold text-white">
              <Recycle className="size-2.5" /> مستعمل
            </span>
          ) : (
            <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-ink shadow-card">جديد</span>
          )}
          {p.network === '5G' && (
            <span className="flex w-fit items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-ink shadow-card">
              <Signal className="size-2.5" /> 5G
            </span>
          )}
        </div>
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 text-xs font-bold text-silver-500">
            غير متوفر
          </div>
        )}
      </Link>

      <Link to={`/product/${p.id}`} className="mt-2 px-0.5">
        <p className="text-[11px] font-medium text-silver-400">{p.brand}</p>
        <h3 className="mt-0.5 line-clamp-1 text-[13px] font-bold text-ink">{p.name}</h3>
        {used && (usedDetails.overall_condition || usedDetails.battery_health) && (
          <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] font-bold">
            {usedDetails.overall_condition && (
              <span className="rounded-full bg-paper px-1.5 py-0.5 text-silver-500">♻️ {usedDetails.overall_condition}</span>
            )}
            {usedDetails.battery_health && (
              <span className="flex items-center gap-0.5 rounded-full bg-paper px-1.5 py-0.5 text-silver-500">
                <BatteryFull className="size-2.5 text-emerald-500" /> {usedDetails.battery_health}%
              </span>
            )}
          </div>
        )}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-base font-extrabold text-ink">{formatPrice(p.price)}</span>
          {p.old_price && Number(p.old_price) > 0 && (
            <span className="text-[11px] font-bold text-silver-400 line-through">{formatPrice(p.old_price)}</span>
          )}
        </div>
        <p className={`mt-0.5 flex items-center gap-1 text-[10px] font-bold ${available ? 'text-emerald-500' : 'text-silver-400'}`}>
          <span className={`size-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-silver-300'}`} />
          {available ? 'متوفر' : 'غير متوفر'}
        </p>
      </Link>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          onClick={() => addToCart(p)}
          disabled={!available}
          className="flex flex-1 items-center justify-center gap-1 rounded-full bg-ink py-2 text-[11px] font-bold text-white transition hover:bg-ink-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-silver-200 disabled:text-silver-400"
        >
          <ShoppingCart className="size-3" />
          أضف للسلة
        </button>
        <button
          onClick={() => toggleCompare(p.id)}
          aria-label="المقارنة"
          className={`flex size-8 shrink-0 items-center justify-center rounded-full transition active:scale-90 ${
            inCompare(p.id) ? 'bg-ink text-white' : 'bg-paper text-ink hover:text-ink-600'
          }`}
        >
          <GitCompare className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
