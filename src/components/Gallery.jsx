import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, ZoomIn } from 'lucide-react'
import { imgFallback } from '../lib/hooks'
import BrandBand from './BrandBand'

export default function Gallery({ images = [], name }) {
  const urls = images.length ? images : ['']
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => setIdx(0), [urls[0]])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox])

  const prev = () => setIdx((i) => (i - 1 + urls.length) % urls.length)
  const next = () => setIdx((i) => (i + 1) % urls.length)

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-paper">
        <button onClick={() => { setLightbox(true); setZoomed(false) }} className="group block w-full">
          <img
            src={urls[idx] || ''}
            alt={name}
            onError={imgFallback}
            className="aspect-square w-full object-contain p-6 transition duration-300 group-hover:scale-[1.03] md:aspect-[4/3]"
          />
          <BrandBand variant="large" />
          <span className="absolute bottom-14 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow-card backdrop-blur">
            <ZoomIn className="size-3.5" /> تكبير الصورة
          </span>
        </button>
        {urls.length > 1 && (
          <>
            <button onClick={prev} aria-label="السابق" className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition hover:bg-white active:scale-90">
              <ChevronRight className="size-5" />
            </button>
            <button onClick={next} aria-label="التالي" className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition hover:bg-white active:scale-90">
              <ChevronLeft className="size-5" />
            </button>
          </>
        )}
      </div>

      {urls.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {urls.map((u, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`shrink-0 overflow-hidden rounded-xl border-2 bg-paper transition ${i === idx ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={u} alt={`${name} ${i + 1}`} loading="lazy" onError={imgFallback} className="size-16 object-contain p-1 md:size-20" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(false)}>
          <button className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="إغلاق">
            <X className="size-5" />
          </button>
          <img
            src={urls[idx]}
            alt={name}
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z) }}
            className={`max-h-full max-w-full rounded-2xl object-contain transition duration-300 ${zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
          />
          {urls.length > 1 && (
            <div className="absolute bottom-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button onClick={prev} className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="size-5" /></button>
              <button onClick={next} className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="size-5" /></button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
