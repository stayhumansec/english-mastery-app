import { db } from './db'
import { computeStreak } from './streak'
import { BADGE_DEFINITIONS } from './badgeDefinitions'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export interface WeeklyRecapData {
  studyMinutes: number
  flashcardsReviewed: number
  newWords: number
  journalWords: number
  streak: number
  streakStatus: 'maintained' | 'broken'
  xpThisWeek: number
  badgesUnlockedThisWeek: string[]
  modulesCompletedThisWeek: string[]
  highlight: string
}

/** Always computed from the last 7 days of already-logged local data — no
 * stored snapshot, so it's never stale relative to what actually happened. */
export async function computeWeeklyRecap(): Promise<WeeklyRecapData> {
  const now = Date.now()
  const cutoff = now - WEEK_MS
  const prevCutoff = now - 2 * WEEK_MS

  const [timerLogs, xpLog, flashcards, journalEntries, modules, badgeUnlocks, accentLogs, sessions] = await Promise.all([
    db.timerLogs.toArray(),
    db.xpLog.toArray(),
    db.flashcards.toArray(),
    db.journalEntries.toArray(),
    db.modules.toArray(),
    db.badgeUnlocks.toArray(),
    db.accentLogs.toArray(),
    db.sessions.toArray(),
  ])

  const inWeek = (t: number) => t >= cutoff
  const inPrevWeek = (t: number) => t >= prevCutoff && t < cutoff

  const studyMinutes = timerLogs.filter((l) => inWeek(l.createdAt)).reduce((s, l) => s + l.durationMinutes, 0)
  const prevStudyMinutes = timerLogs.filter((l) => inPrevWeek(l.createdAt)).reduce((s, l) => s + l.durationMinutes, 0)

  const reviewEntries = xpLog.filter((e) => e.activityType === 'flashcard_review' || e.activityType === 'flashcard_review_easy')
  const flashcardsReviewed = reviewEntries.filter((e) => inWeek(e.timestamp)).length
  const prevFlashcardsReviewed = reviewEntries.filter((e) => inPrevWeek(e.timestamp)).length

  const newWords = flashcards.filter((c) => inWeek(c.createdAt)).length
  const prevNewWords = flashcards.filter((c) => inPrevWeek(c.createdAt)).length

  const journalWords = journalEntries.filter((e) => inWeek(e.createdAt)).reduce((s, e) => s + e.wordCount, 0)
  const prevJournalWords = journalEntries.filter((e) => inPrevWeek(e.createdAt)).reduce((s, e) => s + e.wordCount, 0)

  const xpThisWeek = xpLog.filter((e) => inWeek(e.timestamp)).reduce((s, e) => s + e.xpAwarded, 0)

  const badgesUnlockedThisWeek = badgeUnlocks
    .filter((b) => b.unlockedAt && inWeek(b.unlockedAt))
    .map((b) => BADGE_DEFINITIONS.find((d) => d.id === b.id)?.name)
    .filter((n): n is string => !!n)

  const modulesCompletedThisWeek = modules
    .filter((m) => m.status === 'done' && m.lastPracticedAt && inWeek(m.lastPracticedAt))
    .map((m) => m.title)

  const activeDates = new Set<string>()
  timerLogs.forEach((l) => activeDates.add(l.date))
  accentLogs.forEach((l) => activeDates.add(l.date))
  sessions.forEach((s) => s.completedDates.forEach((d) => activeDates.add(d)))
  const streak = computeStreak(activeDates)
  const streakStatus: WeeklyRecapData['streakStatus'] = streak > 0 ? 'maintained' : 'broken'

  let highlight: string
  if (badgesUnlockedThisWeek.length > 0) {
    highlight = `You unlocked "${badgesUnlockedThisWeek[0]}"!`
  } else if (modulesCompletedThisWeek.length > 0) {
    highlight = `You completed "${modulesCompletedThisWeek[0]}"!`
  } else {
    const improvements = [
      { label: `${studyMinutes} minutes studied`, delta: studyMinutes - prevStudyMinutes },
      { label: `${flashcardsReviewed} flashcards reviewed`, delta: flashcardsReviewed - prevFlashcardsReviewed },
      { label: `${newWords} new words added`, delta: newWords - prevNewWords },
      { label: `${journalWords} words written`, delta: journalWords - prevJournalWords },
    ]
    const best = improvements.reduce((a, b) => (b.delta > a.delta ? b : a))
    highlight = best.delta > 0 ? `${best.label} — your best week recently!` : `${studyMinutes} minutes studied this week`
  }

  return {
    studyMinutes,
    flashcardsReviewed,
    newWords,
    journalWords,
    streak,
    streakStatus,
    xpThisWeek,
    badgesUnlockedThisWeek,
    modulesCompletedThisWeek,
    highlight,
  }
}
