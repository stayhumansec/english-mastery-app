import type { XpActivityType } from './types'

/** XP awarded per activity type — the single place to tune these values. */
export const XP_VALUES: Record<XpActivityType, number> = {
  flashcard_review: 5,
  flashcard_review_easy: 8,
  drill_sentence: 15,
  drill_spot_pattern: 10,
  journal_entry: 20,
  journal_entry_short: 8,
  speaking_prompt: 15,
  input_log_entry: 10,
  module_complete: 60,
  level_complete: 250,
  daily_login: 5,
}

/** Journal entries need at least this many words to count as a "full"
 * entry (20 XP) rather than a short one (8 XP). */
export const JOURNAL_MIN_WORDS_FOR_FULL_XP = 30

/** level = floor(sqrt(totalXP / 100)) — fast early levels, steeper later. */
export function levelForXp(totalXp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, totalXp) / 100))
}

/** Total XP required to reach a given level (inverse of levelForXp). */
export function xpForLevel(level: number): number {
  return level * level * 100
}

export interface LevelProgress {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
  totalXp: number
  pct: number
}

export function levelProgress(totalXp: number): LevelProgress {
  const level = levelForXp(totalXp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  const xpIntoLevel = totalXp - floor
  const xpForNextLevel = ceil - floor
  return {
    level,
    xpIntoLevel,
    xpForNextLevel,
    totalXp,
    pct: xpForNextLevel > 0 ? (xpIntoLevel / xpForNextLevel) * 100 : 100,
  }
}
