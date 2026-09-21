import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTitle } from '../lib/hooks'
import ProductCard from '../components/ProductCard'
import Filters, { defaultFilters } from '../components/Filters'
import { SkeletonGrid, EmptyState, ErrorState } from '../components/UI'
import { PackageSearch } from 'lucide-react'

const PAGE_META = {
  shop: { title: 'المتجر', desc: 'كل المنتجات' },
  new: { title: 'الهواتف الجديدة', desc: 'أحدث الموديلات بضمان المتجر', condition: 'new' },
  used: { title: 'الأجهزة المستعملة', desc: 'أجهزة مفحوصة بحالة ممتازة — بأسعار أوفر', condition: 'used' },
  category: { title: 'قسم', desc: '' },
  search: { title: 'نتائج البحث', desc: '' },
}

export default function Shop({ view = 'shop' }) {
  const { slug } = useParams() // slug only for /category/:slug
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const location = useLocation()
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)

  useEffect(() => setFilters(defaultFilters), [location.pathname, q])

  const meta = useMemo(() => {
    if (view === 'category') return { ...PAGE_META.category, condition: slug === 'used' ? 'used' : undefined, catSlug: slug }
    return PAGE_META[view] || PAGE_META.shop
  }, [view, slug])

  useTitle(meta.title === 'قسم' ? slug : q ? `${meta.title}: ${q}` : meta.title)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    let query = supabase
      .from('products')
      .select('*, product_images(url, sort_order), categories!inner(slug)')
      .eq('is_active', true)

    if (meta.condition) query = query.eq('condition', meta.condition)
    if (view === 'category') query = query.eq('categories.slug', meta.catSlug)
    if (view === 'search' && q.trim()) {
      const term = q.trim()
      query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`)
    }

    query
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(true)
        else setAll(data || [])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [view, meta.catSlug, meta.condition, q])

  const brands = useMemo(() => [...new Set(all.map((p) => p.brand).filter(Boolean))].sort(), [all])

  const filtered = useMemo(() => {
    let list = all
    if (filters.brands.length) list = list.filter((p) => filters.brands.includes(p.brand))
    if (filters.network !== 'all') list = list.filter((p) => p.network === filters.network)
    const min = parseFloat(filters.min)
    const max = parseFloat(filters.max)
    if (!isNaN(min)) list = list.filter((p) => Number(p.price) >= min)
    if (!isNaN(max)) list = list.filter((p) => Number(p.price) <= max)
    if (filters.sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price)
    if (filters.sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [all, filters])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
          {view === 'category' ? CATEGORY_NAMES[slug] || slug : meta.title}
        </h1>
        {meta.desc && <p className="mt-1 text-sm text-silver-500">{meta.desc}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Filters brands={brands} value={filters} onChange={setFilters} />

        <div>
          <p className="mb-4 hidden text-sm font-bold text-silver-500 lg:block">
            {loading ? '...' : `${filtered.length} منتج`}
          </p>
          {loading ? (
            <SkeletonGrid count={8} />
          ) : error ? (
            <ErrorState onRetry={() => window.location.reload()} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="لا توجد منتجات مطابقة"
              desc="جرّب تعديل الفلاتر أو البحث بكلمات مختلفة."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CATEGORY_NAMES = {
  smartphones: 'هواتف ذكية',
  used: 'أجهزة مستعملة',
  audio: 'سماعات وصوتيات',
  chargers: 'شواحن وكابلات',
  cases: 'كفرات وحماية',
  watches: 'ساعات ذكية',
  accessories: 'إكسسوارات',
}
