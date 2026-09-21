import { CURRENCY, ORDER_STATUS, FULFILLMENT, WHATSAPP_NUMBER } from './constants'

export const formatPrice = (n) =>
  `${Number(n || 0).toLocaleString('en-US')}${CURRENCY}`

export const statusInfo = (s) => ORDER_STATUS[s] || ORDER_STATUS.new
export const fulfillmentInfo = (f) => FULFILLMENT[f] || FULFILLMENT.pickup

export const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })
}

export const isAvailable = (p) => Number(p?.stock ?? 0) > 0

export const conditionLabel = (c) => (c === 'used' ? 'مستعمل' : 'جديد')

export const batteryLabel = (b) => (b === null || b === undefined || b === '' ? null : `صحة البطارية ${b}%`)

export const makeOrderNumber = () =>
  'MB-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.floor(Math.random() * 900 + 100)

export const buildWhatsAppMessage = (order, items) => {
  const { customer_name, phone, fulfillment, city, area, address, notes, total, order_number } = order
  const lines = []
  lines.push('🛍️ *طلب جديد*')
  lines.push(`رقم الطلب: ${order_number}`)
  lines.push('')
  lines.push(`👤 اسم العميل: ${customer_name}`)
  lines.push(`📱 رقم الهاتف: ${phone}`)
  lines.push('')
  lines.push('📦 *المنتجات:*')
  for (const it of items) {
    lines.push(`- ${it.product_name} × ${it.qty} — ${formatPrice(it.price * it.qty)}`)
  }
  lines.push('')
  if (fulfillment === 'pickup') {
    lines.push('🏪 *طريقة الاستلام:*')
    lines.push('استلام من المحل')
  } else {
    lines.push('🚚 *طريقة الاستلام:*')
    lines.push('توصيل إلى المنزل')
    lines.push('')
    lines.push('📍 *العنوان:*')
    lines.push(`${city || ''} - ${area || ''} - ${address || ''}`.replace(/^ - | - $/g, ''))
  }
  if (notes) {
    lines.push('')
    lines.push(`📝 ملاحظات: ${notes}`)
  }
  lines.push('')
  lines.push(`💰 *الإجمالي: ${formatPrice(total)}*`)
  return lines.join('\n')
}

export const whatsappLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

export const timeAgo = (iso) => {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'الآن'
  const m = Math.floor(s / 60)
  if (m < 60) return `قبل ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `قبل ${h} ساعة`
  const d = Math.floor(h / 24)
  if (d < 30) return `قبل ${d} يوم`
  return new Date(iso).toLocaleDateString('ar', { day: 'numeric', month: 'long' })
}
