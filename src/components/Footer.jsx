import { Link } from 'react-router-dom'
import { Plus, MessageCircle, MapPin, Phone, Mail, Facebook } from 'lucide-react'
import { CATEGORY_LIST, WHATSAPP_DISPLAY, STORE_PHONE, STORE_EMAIL, STORE_FACEBOOK } from '../lib/constants'
import { APP_VERSION } from '../lib/constants'
import { whatsappLink } from '../lib/format'

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white">
              <Plus className="size-5 text-ink" strokeWidth={3} />
            </span>
            <span className="text-lg font-extrabold text-white">
              Mobily <span className="text-silver-300">Bro</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-silver-400">
            وجهتك الأولى للهواتف الذكية الجديدة والمستعملة بحالة ممتازة، مع أفضل الإكسسوارات وأسعار تنافسية. اطلب الآن واستلم من المحل أو نوصل حتى باب بيتك.
          </p>
            <a
              href={STORE_FACEBOOK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition hover:text-white"
            >
              <Facebook className="size-4 text-silver-300" /> صفحتنا على فيسبوك
            </a>
        </div>

        <div>
          <h4 className="mb-4 font-bold">روابط سريعة</h4>
          <ul className="space-y-2.5 text-sm text-silver-400">
            <li><Link to="/new" className="transition hover:text-white">الهواتف الجديدة</Link></li>
            <li><Link to="/used" className="transition hover:text-white">الأجهزة المستعملة</Link></li>
            <li><Link to="/compare" className="transition hover:text-white">مقارنة الهواتف</Link></li>
            <li><Link to="/favorites" className="transition hover:text-white">المفضلة</Link></li>
            <li><Link to="/orders" className="transition hover:text-white">طلباتي</Link></li>
            <li><Link to="/topup" className="transition hover:text-white">شحن التطبيقات ⚡</Link></li>
            <li><Link to="/about" className="transition hover:text-white">من نحن</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold">تواصل معنا</h4>
          <div className="space-y-3 text-sm text-silver-400">
            <a href={whatsappLink('مرحبًا، لدي استفسار عن المنتجات 🙌')} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-white">
              <MessageCircle className="size-4 text-wa" /> واتساب: <span dir="ltr">{WHATSAPP_DISPLAY}</span>
            </a>
            <a href={`tel:${STORE_PHONE}`} className="flex items-center gap-2 transition hover:text-white">
              <Phone className="size-4 text-white" /> اتصال: <span dir="ltr">{STORE_PHONE}</span>
            </a>
            <a href={`mailto:${STORE_EMAIL}`} className="flex items-center gap-2 transition hover:text-white">
              <Mail className="size-4 text-white" /> <span dir="ltr">{STORE_EMAIL}</span>
            </a>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-silver-500" /> المدينة — الشارع الرئيسي</p>
            <a
              href={whatsappLink('مرحبًا، لدي استفسار عن المنتجات 🙌')}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95 active:scale-95"
            >
              <MessageCircle className="size-4" /> تواصل عبر واتساب
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="text-center text-xs text-silver-500">
          © {new Date().getFullYear()} Mobily Bro — جميع الحقوق محفوظة · الإصدار {APP_VERSION}
        </p>
      </div>
    </footer>
  )
}
