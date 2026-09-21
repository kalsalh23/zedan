import { WHATSAPP_DISPLAY, STORE_PHONE, STORE_EMAIL, STORE_FACEBOOK } from './constants'
import { whatsappLink } from './format'

// —— بيانات صفحة «من نحن» — عدّل من هنا فقط
export const OWNER = {
  name: 'أيمن زيدان',
  role: 'صاحب المتجر',
  initial: 'أ',
  bio: 'شغوف بعالم الهواتف الذكية، أسعى لتقديم أجهزة أصلية مفحوصة بعناية وأسعار عادلة لكل عميل.',
  accounts: [
    { icon: 'whatsapp', label: 'واتساب', value: WHATSAPP_DISPLAY, href: whatsappLink('مرحبًا، لدي استفسار عن المنتجات 🙌') },
    { icon: 'phone', label: 'اتصال', value: STORE_PHONE, href: `tel:${STORE_PHONE}` },
    { icon: 'email', label: 'البريد الإلكتروني', value: STORE_EMAIL, href: `mailto:${STORE_EMAIL}` },
    { icon: 'facebook', label: 'فيسبوك', value: 'صفحة Mobily Bro', href: STORE_FACEBOOK },
  ],
}

export const DEVELOPER = {
  name: 'قصي مهند الصالح',
  role: 'مطوّر المنصة',
  initial: 'ق',
  tagline: 'تصميم وتطوير متجر Mobily Bro بالكامل — الواجهة، لوحة التحكم، وقاعدة البيانات.',
  accounts: [
    { icon: 'facebook', label: 'فيسبوك', value: 'Kusai Al-Saleh', href: 'https://www.facebook.com/share/18AccZEvRn/' },
    { icon: 'instagram', label: 'انستغرام', value: 'kosai_al_saleh', href: 'https://www.instagram.com/kosai_al_saleh?stkn=cWM0dzEzaThqN2sz' },
    { icon: 'whatsapp', label: 'واتساب', value: '+84 38 267 6210', href: 'https://wa.me/84382676210' },
    { icon: 'phone', label: 'اتصال', value: '0952639157', href: 'tel:0952639157' },
  ],
}
