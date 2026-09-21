import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CATEGORY_LIST } from '../lib/constants'
import { useTitle } from '../lib/hooks'
import CategoryIcon from '../components/CategoryIcon'
import ProductCard from '../components/ProductCard'
import { SectionTitle, SkeletonGrid } from '../components/UI'

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-4xl bg-ink text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-accent/40 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 size-72 rounded-full bg-accent/25 blur-[100px]" />
      <div className="relative grid items-center gap-6 p-6 md:grid-cols-2 md:p-12">
        <div className="animate-fade-up py-4 text-center md:text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-purple-300">
            <Sparkles className="size-3.5" /> جديد ومستعمل بحالة ممتازة
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
            أحدث الهواتف
            <br />
            <span className="text-purple-400">بأسعار لا تُنافس</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-silver-300 md:mx-0 md:text-base">
            هواتف ذكية جديدة ومستعملة مفحوصة بعناية، سماعات، شواحن وإكسسوارات أصلية — اطلب الآن واستلم من المحل أو نوصل حتى باب بيتك.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              to="/shop"
              className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold shadow-glow transition hover:bg-accent-dark active:scale-95"
            >
              تسوق الآن
            </Link>
            <Link
              to="/used"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold backdrop-blur transition hover:bg-white/10 active:scale-95"
            >
              أجهزة مستعملة ♻️
            </Link>
          </div>
        </div>
        <div className="relative hidden justify-center md:flex">
          <img
            src="https://cdn.dummyjson.com/products/images/smartphones/iPhone%2015%20Pro/2.png"
            alt="هاتف حديث"
            className="w-80 rotate-[-6deg] rounded-3xl drop-shadow-2xl"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      </div>
    </section>
  )
}

function Categories({ categories }) {
  const list = categories.length
    ? categories
    : CATEGORY_LIST.map((c, i) => ({ ...c, id: i }))
  return (
    <section>
      <SectionTitle title="تسوق حسب القسم" subtitle="كل ما يحتاجه هاتفك في مكان واحد" />
      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible">
        {list.map((c) => {
          const slug = c.slug === 'used' ? 'used' : c.slug
          return (
            <Link key={c.slug} to={slug === 'used' ? '/used' : `/category/${c.slug}`} className="group flex w-20 shrink-0 flex-col items-center gap-2 lg:w-auto">
              <span className="flex size-16 items-center justify-center rounded-full bg-white text-ink shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-accent/40 group-hover:shadow-soft lg:size-full lg:aspect-square">
                <CategoryIcon icon={c.icon} className="size-7 text-accent" />
              </span>
              <span className="text-center text-[11px] font-bold leading-tight text-ink">{c.name}</span>
            </Link>
          )
        })}
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

function OffersBanner({ offers }) {
  if (!offers?.length) return null
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {offers.map((o) => (
        <Link
          key={o.id}
          to="/shop"
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-l from-accent to-accent-dark p-6 text-white shadow-glow"
        >
          <div className="flex-1">
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold">عرض {o.discount}</span>
            <h3 className="mt-2 text-xl font-extrabold">{o.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-white/80">{o.description}</p>
          </div>
          {o.image_url && (
            <img src={o.image_url} alt={o.title} loading="lazy" className="hidden h-24 w-24 rounded-2xl object-cover transition group-hover:scale-105 sm:block" />
          )}
        </Link>
      ))}
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
      <Hero />
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
