import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CATEGORY_LIST } from '../lib/constants'
import { useTitle, imgFallback } from '../lib/hooks'
import CategoryIcon from '../components/CategoryIcon'
import ProductCard from '../components/ProductCard'
import { SectionTitle, SkeletonGrid } from '../components/UI'

function OffersBanner({ offers }) {
  if (!offers?.length) return null
  return (
    <section className="space-y-4">
      {offers.map((o) => (
        <Link
          key={o.id}
          to="/shop"
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-soft md:p-8"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-flame/25 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 size-56 rounded-full bg-accent/30 blur-[80px]" />
          <div className="relative flex-1 min-w-0">
            <span className="inline-block rounded-full bg-flame px-3.5 py-1.5 text-xs font-extrabold text-white shadow-card">
              خصم {o.discount}
            </span>
            <h2 className="mt-3 text-xl font-extrabold md:text-2xl">{o.title}</h2>
            {o.description && (
              <p className="mt-1.5 line-clamp-2 max-w-lg text-xs leading-relaxed text-silver-300 md:text-sm">
                {o.description}
              </p>
            )}
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-2.5 text-xs font-bold shadow-glow transition group-hover:bg-accent-dark active:scale-95">
              تسوق العرض <ArrowLeft className="size-3.5" />
            </span>
          </div>
          {o.image_url && (
            <img
              src={o.image_url}
              alt={o.title}
              loading="lazy"
              className="relative hidden h-28 w-28 shrink-0 rounded-2xl object-cover shadow-soft transition duration-300 group-hover:scale-105 md:block"
            />
          )}
        </Link>
      ))}
    </section>
  )
}

function Categories({ categories }) {
  const list = categories.length ? categories : CATEGORY_LIST.map((c, i) => ({ ...c, id: i }))
  return (
    <section>
      <SectionTitle title="تسوق حسب القسم" subtitle="كل ما يحتاجه هاتفك في مكان واحد" />
      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
        {list.map((c) => (
          <Link key={c.slug} to={c.slug === 'used' ? '/used' : `/category/${c.slug}`} className="group flex w-20 shrink-0 flex-col items-center gap-2 lg:w-auto">
            <span className="size-16 overflow-hidden rounded-full bg-white shadow-card ring-2 ring-transparent transition duration-300 group-hover:-translate-y-1 group-hover:ring-accent/40 group-hover:shadow-soft lg:size-auto lg:aspect-square lg:w-full">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} loading="lazy" onError={imgFallback} className="size-full object-cover transition duration-300 group-hover:scale-110" />
              ) : (
                <span className="flex size-full items-center justify-center">
                  <CategoryIcon icon={c.icon} className="size-7 text-accent" />
                </span>
              )}
            </span>
            <span className="text-center text-[11px] font-bold leading-tight text-ink">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductRow({ title, subtitle, to, products, loading, badge }) {
  return (
    <section>
      <SectionTitle
        title={<span className="flex items-center gap-2">{badge} {title}</span>}
        subtitle={subtitle}
        action={
          <Link to={to} className="flex shrink-0 items-center gap-1 text-sm font-bold text-accent transition hover:gap-2">
            عرض الكل <ArrowLeft className="size-4" />
          </Link>
        }
      />
      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 md:gap-5">
          {products.map((p) => (
            <div key={p.id} className="w-44 shrink-0 md:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function Home() {
  useTitle('الرئيسية')
  const [newPhones, setNewPhones] = useState([])
  const [used, setUsed] = useState([])
  const [offers, setOffers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from('products').select('*, product_images(url, sort_order)').eq('condition', 'new').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('products').select('*, product_images(url, sort_order)').eq('condition', 'used').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('offers').select('*').eq('is_active', true).gte('ends_at', new Date().toISOString().slice(0, 10)).limit(2),
      supabase.from('categories').select('*').order('sort_order'),
    ]).then(([n, u, o, c]) => {
      if (!active) return
      setNewPhones(n.data || [])
      setUsed(u.data || [])
      setOffers(o.data || [])
      setCategories(c.data || [])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-10">
      <OffersBanner offers={offers} />
      <Categories categories={categories} />
      <ProductRow
        title="أحدث الهواتف الجديدة"
        subtitle="أحدث الموديلات بضمان المتجر"
        to="/new"
        badge={<span className="text-xl">📱</span>}
        products={newPhones}
        loading={loading}
      />
      <ProductRow
        title="أجهزة مستعملة بحالة ممتازة"
        subtitle="مفحوصة ومضمونة — بأسعار أوفر"
        to="/used"
        badge={<span className="text-xl">♻️</span>}
        products={used}
        loading={loading}
      />
    </div>
  )
}
