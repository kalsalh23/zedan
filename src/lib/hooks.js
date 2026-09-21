import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Mobily Bro` : 'Mobily Bro | متجر الهواتف الذكية والإكسسوارات'
    return () => {
      document.title = 'Mobily Bro | متجر الهواتف الذكية والإكسسوارات'
    }
  }, [title])
}

export function useProductsByIds(ids) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const key = (ids || []).join(',')

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setProducts([])
      return
    }
    let active = true
    setLoading(true)
    supabase
      .from('products')
      .select('*, product_images(url, sort_order)')
      .in('id', ids)
      .then(({ data }) => {
        if (!active) return
        setProducts(data || [])
        setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { products, loading }
}

export function useDebounce(value, ms = 250) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export async function searchProducts(q, limit = 8) {
  const term = (q || '').trim()
  if (!term) return []
  const { data } = await supabase
    .from('products')
    .select('id, name, brand, price, condition, main_image, stock')
    .or(`name.ilike.%${term}%,brand.ilike.%${term}%`)
    .limit(limit)
  return data || []
}

export const imgFallback = (e) => {
  const el = e.currentTarget
  if (!el.dataset.fb) {
    el.dataset.fb = '1'
    el.src =
      'data:image/svg+xml,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" rx="24" fill="#F4F4F5"/><text x="200" y="205" font-size="26" text-anchor="middle" fill="#09090B" font-family="sans-serif">Mobily Bro</text></svg>`
      )
  }
}
