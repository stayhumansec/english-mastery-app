import { db } from './db'
import { computeStreak } from './streak'
import { BADGE_DEFINITIONS, type BadgeContext, type BadgeDefinition } from './badgeDefinitions'
import { CEFR_LEVELS, type CefrLevel, type RoadmapModule } from './types'

export async function buildBadgeContext(): Promise<BadgeContext> {
  const [modules, timerLogs, accentLogs, journalEntries, drillAttempts, sessions, xpLog] = await Promise.all([
    db.modules.toArray(),
    db.timerLogs.toArray(),
    db.accentLogs.toArray(),
    db.journalEntries.toArray(),
    db.drillAttempts.toArray(),
    db.sessions.toArray(),
    db.xpLog.toArray(),
  ])

  const activeDates = new Set<string>()
  timerLogs.forEach((l) => activeDates.add(l.date))
  accentLogs.forEach((l) => activeDates.add(l.date))
  sessions.forEach((s) => s.completedDates.forEach((d) => activeDates.add(d)))
  const streak = computeStreak(activeDates)

  const modulesByLevel = {} as Record<CefrLevel, RoadmapModule[]>
  for (const level of CEFR_LEVELS) modulesByLevel[level] = modules.filter((m) => m.level === level)

  const flashcardReviewCount = xpLog.filter(
    (e) => e.activityType === 'flashcard_review' || e.activityType === 'flashcard_review_easy',
  ).length

  const earlyBirdCount = timerLogs.filter((l) => new Date(l.startedAt).getHours() < 8).length
  const nightOwlCount = timerLogs.filter((l) => new Date(l.startedAt).getHours() >= 21).length

  return {
    streak,
    flashcardReviewCount,
    modulesByLevel,
    accentLogsCount: accentLogs.length,
    journalEntriesCount: journalEntries.length,
    drillAttemptsCount: drillAttempts.length,
    earlyBirdCount,
    nightOwlCount,
  }
}

export interface BadgeStatus {
  def: BadgeDefinition
  progressValue: number
  unlocked: boolean
  unlockedAt: number | null
}

/** Re-evaluates every badge against current local data and unlocks any
 * that newly qualify. Safe to call after any logged action — cheap local
 * table reads, no external calls. */
export async function evaluateBadges(): Promise<{ statuses: BadgeStatus[]; newlyUnlocked: BadgeStatus[] }> {
  const ctx = await buildBadgeContext()
  const existing = await db.badgeUnlocks.toArray()
  const existingMap = new Map(existing.map((b) => [b.id, b]))

  const statuses: BadgeStatus[] = []
  const newlyUnlocked: BadgeStatus[] = []

  for (const def of BADGE_DEFINITIONS) {
    const progressValue = def.progress(ctx)
    const meetsTarget = progressValue >= def.target
    const existingRow = existingMap.get(def.id)
    let unlockedAt = existingRow?.unlockedAt ?? null

    if (meetsTarget && !unlockedAt) {
      unlockedAt = Date.now()
      await db.badgeUnlocks.put({ id: def.id, category: def.category, unlockedAt })
      newlyUnlocked.push({ def, progressValue, unlocked: true, unlockedAt })
    }

    statuses.push({ def, progressValue, unlocked: !!unlockedAt, unlockedAt })
  }

  return { statuses, newlyUnlocked }
}
