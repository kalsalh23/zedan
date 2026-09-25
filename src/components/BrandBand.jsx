export default function BrandBand({ variant = 'strip' }) {
  if (variant === 'circle') {
    return (
      <span className="absolute inset-x-0 bottom-0 z-10 flex h-1/3 items-end justify-center rounded-b-full bg-gradient-to-t from-ink/95 via-ink/80 to-transparent pb-[9%]">
        <span className="text-[8px] font-extrabold tracking-[0.2em] text-white">MOBILY BRO</span>
      </span>
    )
  }
  if (variant === 'large') {
    return (
      <span className="absolute inset-x-0 bottom-0 z-10 flex h-10 items-center justify-center bg-gradient-to-t from-ink/90 via-ink/70 to-transparent">
        <span className="text-[10px] font-extrabold tracking-[0.25em] text-white">MOBILY BRO</span>
      </span>
    )
  }
  return (
    <span className="absolute inset-x-0 bottom-0 z-10 flex h-6 items-center justify-center bg-gradient-to-t from-ink/85 via-ink/60 to-transparent">
      <span className="text-[8px] font-extrabold tracking-[0.22em] text-white">MOBILY BRO</span>
    </span>
  )
}
