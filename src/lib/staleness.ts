import { db } from './db'
import { patternsForModule } from './weeklyFocus'
import type { RoadmapModule } from './types'

const STALE_MS = 21 * 24 * 60 * 60 * 1000

export interface StaleModule {
  module: RoadmapModule
  daysSincePracticed: number
}

/** A "done" module needs a refresh once its completion timestamp is more
 * than 21 days old AND no flashcard or drill tied to its linked pattern(s)
 * has been touched in that window. */
export async function computeStaleModules(): Promise<StaleModule[]> {
  const [modules, patterns, flashcards, drillAttempts] = await Promise.all([
    db.modules.toArray(),
    db.patterns.toArray(),
    db.flashcards.toArray(),
    db.drillAttempts.toArray(),
  ])

  const now = Date.now()
  const stale: StaleModule[] = []

  for (const mod of modules) {
    if (mod.status !== 'done') continue
    const completedAt = mod.lastPracticedAt ?? mod.createdAt
    if (now - completedAt < STALE_MS) continue

    const linkedPatternIds = new Set(patternsForModule(mod, patterns).map((p) => p.id))

    const recentFlashcard = flashcards.some(
      (c) => c.patternId && linkedPatternIds.has(c.patternId) && c.lastReviewedAt && now - c.lastReviewedAt < STALE_MS,
    )
    const recentDrill = drillAttempts.some(
      (a) => a.patternId && linkedPatternIds.has(a.patternId) && now - a.createdAt < STALE_MS,
    )

    if (!recentFlashcard && !recentDrill) {
      stale.push({ module: mod, daysSincePracticed: Math.floor((now - completedAt) / (24 * 60 * 60 * 1000)) })
    }
  }

  return stale.sort((a, b) => b.daysSincePracticed - a.daysSincePracticed)
}

/** Resets a module's staleness timer — called once a refresh (pattern
 * review + a few out-of-cycle flashcards) is completed. */
export async function markModuleRefreshed(moduleId: string): Promise<void> {
  await db.modules.update(moduleId, { lastPracticedAt: Date.now() })
}
