import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useProductsByIds, useTitle, imgFallback } from '../lib/hooks'
import { formatPrice } from '../lib/format'
import { EmptyState, Spinner } from '../components/UI'

export default function Favorites() {
  useTitle('المفضلة')
  const { favorites, toggleFav, addToCart } = useApp()
  const { products, loading } = useProductsByIds(favorites)

  if (loading) return <Spinner />
  if (!favorites.length)
    return (
      <EmptyState
        icon={Heart}
        title="قائمة المفضلة فارغة"
        desc="اضغط على أيقونة القلب في أي منتج لحفظه هنا والرجوع إليه لاحقًا."
        action={
          <Link to="/shop" className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-dark active:scale-95">
            تصفح المنتجات
          </Link>
        }
      />
    )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink md:text-3xl">المفضلة ❤️</h1>
      <div className="space-y-3">
        {favorites.map((id) => {
          const p = products.find((x) => x.id === id)
          if (!p) return null
          return (
            <div key={id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-card">
              <Link to={`/product/${p.id}`} className="shrink-0">
                <img src={p.main_image} alt={p.name} onError={imgFallback} className="size-20 rounded-xl bg-paper object-contain p-1" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-silver-400">{p.brand}</p>
                <Link to={`/product/${p.id}`} className="line-clamp-1 text-sm font-extrabold text-ink hover:text-accent">
                  {p.name}
                </Link>
                <p className="mt-1 font-extrabold text-accent">{formatPrice(p.price)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => addToCart(p)}
                  disabled={Number(p.stock) <= 0}
                  className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-ink-800 active:scale-95 disabled:bg-silver-200 disabled:text-silver-400"
                >
                  <ShoppingCart className="size-3.5" /> للسلة
                </button>
                <button
                  onClick={() => toggleFav(p.id)}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-paper px-4 py-2 text-xs font-bold text-silver-500 transition hover:text-red-500"
                >
                  <X className="size-3.5" /> إزالة
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
