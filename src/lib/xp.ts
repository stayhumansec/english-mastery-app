import { v4 as uuid } from 'uuid'
import { db } from './db'
import { XP_VALUES } from './xpConfig'
import { todayIso } from './date'
import type { XpActivityType } from './types'

export async function awardXp(activityType: XpActivityType, sourceId?: string): Promise<void> {
  await db.xpLog.add({
    id: uuid(),
    timestamp: Date.now(),
    activityType,
    xpAwarded: XP_VALUES[activityType],
    sourceId,
  })
}

/** Awards the once-per-day login bonus if not already awarded today. Call
 * once per app session (e.g. from App.tsx on mount). */
export async function awardDailyLoginBonusIfNeeded(): Promise<void> {
  const start = new Date(`${todayIso()}T00:00:00`).getTime()
  const end = start + 24 * 60 * 60 * 1000
  const existing = await db.xpLog
    .where('activityType')
    .equals('daily_login')
    .filter((e) => e.timestamp >= start && e.timestamp < end)
    .first()
  if (!existing) await awardXp('daily_login')
}

export async function totalXp(): Promise<number> {
  const entries = await db.xpLog.toArray()
  return entries.reduce((sum, e) => sum + e.xpAwarded, 0)
}
