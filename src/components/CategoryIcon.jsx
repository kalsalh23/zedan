import { Smartphone, Recycle, Headphones, Plug, ShieldCheck, Watch, Puzzle, Tablet, Box } from 'lucide-react'

const MAP = {
  smartphone: Smartphone,
  tablet: Tablet,
  recycle: Recycle,
  headphones: Headphones,
  plug: Plug,
  plugzap: Plug,
  shield: ShieldCheck,
  watch: Watch,
  puzzle: Puzzle,
}

export default function CategoryIcon({ icon, className = 'size-6' }) {
  const Icon = MAP[(icon || '').toLowerCase()] || Box
  return <Icon className={className} />
}
