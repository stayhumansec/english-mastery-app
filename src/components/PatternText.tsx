import { PATTERN_ROLE_COLORS, type PatternSegment } from '../lib/types'

export default function PatternText({ segments }: { segments: PatternSegment[] }) {
  return (
    <span>
      {segments.map((seg, i) =>
        seg.role ? (
          <span
            key={i}
            className="rounded px-1 font-medium"
            style={{
              color: PATTERN_ROLE_COLORS[seg.role],
              backgroundColor: `${PATTERN_ROLE_COLORS[seg.role]}1a`,
            }}
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  )
}

export function PatternRoleLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
      {(Object.entries(PATTERN_ROLE_COLORS) as Array<[keyof typeof PATTERN_ROLE_COLORS, string]>).map(
        ([role, color]) => (
          <span key={role} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {role === 'subject' ? 'Subject' : role === 'verb' ? 'Verb / auxiliary' : 'Object / complement'}
          </span>
        ),
      )}
    </div>
  )
}
