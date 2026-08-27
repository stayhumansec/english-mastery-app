import { useState } from 'react'
import Confetti from './motion/Confetti'
import { awardXp } from '../lib/xp'
import { evaluateBadges } from '../lib/badges'
import { FEATURE_COLORS, type RecognitionToken } from '../lib/types'

export default function SpotThePattern({
  tokens,
  patternName,
  ruleExplanation,
}: {
  tokens: RecognitionToken[]
  patternName: string
  ruleExplanation: string
}) {
  const [selectedIdx, setSelectedIdx] = useState<Set<number>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [burst, setBurst] = useState(0)

  const toggle = (i: number) => {
    if (submitted) return
    setSelectedIdx((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const reset = () => {
    setSelectedIdx(new Set())
    setSubmitted(false)
  }

  const correctCount = tokens.filter((t, i) => t.isTarget && selectedIdx.has(i)).length
  const totalTargets = tokens.filter((t) => t.isTarget).length
  const perfect = correctCount === totalTargets

  const handleSubmit = () => {
    setSubmitted(true)
    if (perfect) setBurst((b) => b + 1)
    awardXp('drill_spot_pattern')
    evaluateBadges()
  }

  return (
    <section className="card relative space-y-3 p-4">
      <Confetti trigger={burst} />
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Spot the Pattern: {patternName}</h2>
        {submitted && (
          <span className="text-xs font-bold" style={{ color: perfect ? 'var(--accent)' : 'var(--text-muted)' }}>
            {correctCount}/{totalTargets} found {perfect ? '🎉' : ''}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--text-muted)]">Click every word or phrase that matches this pattern, then submit.</p>
      <p className="leading-loose">
        {tokens.map((t, i) => {
          const isSelected = selectedIdx.has(i)
          let className = 'cursor-pointer rounded px-0.5'
          if (!submitted) {
            className += isSelected ? ' bg-[var(--accent-soft)]' : ''
          } else if (t.isTarget && isSelected) {
            className += ' bg-emerald-200 text-emerald-900'
          } else if (t.isTarget && !isSelected) {
            className += ' bg-amber-200 text-amber-900 underline'
          } else if (!t.isTarget && isSelected) {
            className += ' bg-red-200 text-red-900 line-through'
          }
          return (
            <span key={i} onClick={() => toggle(i)} className={className}>
              {t.text}{' '}
            </span>
          )
        })}
      </p>

      {submitted && (
        <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--purple-soft)' }}>
          <p className="font-bold" style={{ color: 'var(--purple)' }}>Rule</p>
          <p className="mt-1 text-[var(--text)]">{ruleExplanation}</p>
        </div>
      )}

      <div className="flex gap-2">
        {!submitted ? (
          <button onClick={handleSubmit} className="btn px-4 py-1.5 text-sm text-white" style={{ background: FEATURE_COLORS.patterns }}>
            Submit
          </button>
        ) : (
          <button onClick={reset} className="btn btn-secondary px-4 py-1.5 text-sm">
            Try again
          </button>
        )}
      </div>
    </section>
  )
}
