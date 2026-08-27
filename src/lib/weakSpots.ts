import { db } from './db'
import type { DrillAttempt, Pattern } from './types'

export interface WeakSpot {
  patternId: string
  pattern?: Pattern
  score: number
  lastAttemptedDate: string
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function isQualifying(a: DrillAttempt): boolean {
  if (a.confidence === 'unsure') return true
  const sc = a.selfCheck
  if (!sc) return false
  return sc.grammarCorrect !== 'yes' || sc.soundsNatural !== 'yes' || sc.rightRegister !== 'yes'
}

/** Rolling weak-spot score per pattern: qualifying attempts (marked unsure,
 * or any self-check answered "no"/"unsure") within the last 30 days.
 * Surfaced once a pattern has 2+ qualifying attempts, sorted worst-first. */
export async function computeWeakSpots(): Promise<WeakSpot[]> {
  const [attempts, patterns] = await Promise.all([db.drillAttempts.toArray(), db.patterns.toArray()])
  const patternMap = new Map(patterns.map((p) => [p.id, p]))
  const cutoff = Date.now() - THIRTY_DAYS_MS

  const byPattern = new Map<string, DrillAttempt[]>()
  for (const a of attempts) {
    if (!a.patternId || a.createdAt < cutoff || !isQualifying(a)) continue
    const list = byPattern.get(a.patternId) ?? []
    list.push(a)
    byPattern.set(a.patternId, list)
  }

  const spots: WeakSpot[] = []
  for (const [patternId, list] of byPattern) {
    if (list.length < 2) continue
    const lastAttemptedDate = list.reduce((latest, a) => (a.date > latest ? a.date : latest), list[0].date)
    spots.push({ patternId, pattern: patternMap.get(patternId), score: list.length, lastAttemptedDate })
  }

  return spots.sort((a, b) => b.score - a.score)
}
