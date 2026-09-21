export const STORE_NAME = 'Mobily Bro'
export const STORE_NAME_AR = 'موبايلي برو'

// ---- Real store contacts ----
// WhatsApp ordering — the store's main order channel
export const WHATSAPP_NUMBER = '966558738443' // wa.me international format
export const WHATSAPP_DISPLAY = '+966 55 873 8443' // display format
export const STORE_PHONE = '0958628359' // call line
export const STORE_EMAIL = 'rainman180.ayman@gmail.com'
export const STORE_FACEBOOK = 'https://www.facebook.com/share/19cNPHEyPA/'

export const CURRENCY = '$'
export const LOW_STOCK_THRESHOLD = 3
export const COMPARE_MAX = 3

export const CATEGORY_LIST = [
  { slug: 'smartphones', name: 'هواتف ذكية', icon: 'smartphone' },
  { slug: 'used', name: 'أجهزة مستعملة', icon: 'recycle' },
  { slug: 'audio', name: 'سماعات وصوتيات', icon: 'headphones' },
  { slug: 'chargers', name: 'شواحن وكابلات', icon: 'plug' },
  { slug: 'cases', name: 'كفرات وحماية', icon: 'shield' },
  { slug: 'watches', name: 'ساعات ذكية', icon: 'watch' },
  { slug: 'accessories', name: 'إكسسوارات', icon: 'puzzle' },
]

export const ORDER_STATUS = {
  new: { label: 'جديد', color: 'bg-accent-soft text-accent' },
  preparing: { label: 'قيد التجهيز', color: 'bg-amber-50 text-amber-600' },
  ready: { label: 'جاهز', color: 'bg-sky-50 text-sky-600' },
  delivered: { label: 'تم التسليم', color: 'bg-emerald-50 text-emerald-600' },
}

export const FULFILLMENT = {
  pickup: { label: 'استلام من المحل', emoji: '🏪' },
  delivery: { label: 'توصيل إلى المنزل', emoji: '🚚' },
}
