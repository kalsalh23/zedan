import { Link } from 'react-router-dom'
import { Plus, MessageCircle, MapPin, Phone } from 'lucide-react'
import { CATEGORY_LIST, WHATSAPP_LOCAL } from '../lib/constants'
import { whatsappLink } from '../lib/format'

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent">
              <Plus className="size-5 text-white" strokeWidth={3} />
            </span>
            <span className="text-lg font-extrabold">
              Mobily <span className="text-purple-400">Bro</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-silver-400">
            وجهتك الأولى للهواتف الذكية الجديدة والمستعملة بحالة ممتازة، مع أفضل الإكسسوارات وأسعار تنافسية. اطلب الآن واستلم من المحل أو نوصل حتى باب بيتك.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-bold">روابط سريعة</h4>
          <ul className="space-y-2.5 text-sm text-silver-400">
            <li><Link to="/new" className="transition hover:text-white">الهواتف الجديدة</Link></li>
            <li><Link to="/used" className="transition hover:text-white">الأجهزة المستعملة</Link></li>
            <li><Link to="/compare" className="transition hover:text-white">مقارنة الهواتف</Link></li>
            <li><Link to="/favorites" className="transition hover:text-white">المفضلة</Link></li>
            <li><Link to="/orders" className="transition hover:text-white">طلباتي</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold">تواصل معنا</h4>
          <div className="space-y-3 text-sm text-silver-400">
            <p className="flex items-center gap-2"><Phone className="size-4 text-purple-400" /> {WHATSAPP_LOCAL}</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-purple-400" /> المدينة — الشارع الرئيسي</p>
            <a
              href={whatsappLink('مرحبًا، لدي استفسار عن المنتجات 🙌')}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-95"
            >
              <MessageCircle className="size-4" />
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="text-center text-xs text-silver-500">
          © {new Date().getFullYear()} Mobily Bro — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  )
}
