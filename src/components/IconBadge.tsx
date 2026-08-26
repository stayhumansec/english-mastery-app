import type { LucideIcon } from 'lucide-react'

/** A colored circular chip behind an icon — reads as a bold, filled,
 * playful shape instead of a thin outline icon floating on white. */
export default function IconBadge({
  icon: Icon,
  color,
  size = 40,
  iconColor = 'white',
}: {
  icon: LucideIcon
  color: string
  size?: number
  iconColor?: string
}) {
  return (
    <div className="icon-badge" style={{ width: size, height: size, background: color }}>
      <Icon size={Math.round(size * 0.55)} color={iconColor} strokeWidth={2.5} />
    </div>
  )
}
