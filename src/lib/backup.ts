import { db } from './db'
import { todayIso } from './date'
import type {
  AccentLog,
  AppSettings,
  BadgeUnlock,
  CalendarSession,
  DrillAttempt,
  Flashcard,
  InputLogEntry,
  JournalEntry,
  Pattern,
  RoadmapModule,
  ScenarioPrompt,
  TimerLog,
  WordLookup,
  XpLogEntry,
} from './types'

export const BACKUP_SCHEMA_VERSION = 1

export interface BackupData {
  schemaVersion: number
  exportedAt: number
  modules: RoadmapModule[]
  sessions: CalendarSession[]
  timerLogs: TimerLog[]
  flashcards: Flashcard[]
  accentLogs: AccentLog[]
  settings: AppSettings[]
  inputLogs: InputLogEntry[]
  journalEntries: JournalEntry[]
  scenarioPrompts: ScenarioPrompt[]
  drillAttempts: DrillAttempt[]
  patterns: Pattern[]
  wordLookups: WordLookup[]
  xpLog: XpLogEntry[]
  badgeUnlocks: BadgeUnlock[]
}

const LAST_BACKUP_KEY = 'english-mastery:last-backup-at'

export async function buildBackup(): Promise<BackupData> {
  const [
    modules,
    sessions,
    timerLogs,
    flashcards,
    accentLogs,
    settings,
    inputLogs,
    journalEntries,
    scenarioPrompts,
    drillAttempts,
    patterns,
    wordLookups,
    xpLog,
    badgeUnlocks,
  ] = await Promise.all([
    db.modules.toArray(),
    db.sessions.toArray(),
    db.timerLogs.toArray(),
    db.flashcards.toArray(),
    db.accentLogs.toArray(),
    db.settings.toArray(),
    db.inputLogs.toArray(),
    db.journalEntries.toArray(),
    db.scenarioPrompts.toArray(),
    db.drillAttempts.toArray(),
    db.patterns.toArray(),
    db.wordLookups.toArray(),
    db.xpLog.toArray(),
    db.badgeUnlocks.toArray(),
  ])

  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: Date.now(),
    modules,
    sessions,
    timerLogs,
    flashcards,
    accentLogs,
    settings,
    inputLogs,
    journalEntries,
    scenarioPrompts,
    drillAttempts,
    patterns,
    wordLookups,
    xpLog,
    badgeUnlocks,
  }
}

export function downloadBackup(data: BackupData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `english-mastery-backup-${todayIso()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()))
}

export function getLastBackupAt(): number | null {
  const raw = localStorage.getItem(LAST_BACKUP_KEY)
  return raw ? Number(raw) : null
}

const REQUIRED_ARRAY_KEYS: Array<keyof BackupData> = [
  'modules',
  'sessions',
  'timerLogs',
  'flashcards',
  'accentLogs',
  'settings',
  'inputLogs',
  'journalEntries',
  'scenarioPrompts',
  'drillAttempts',
  'patterns',
  'wordLookups',
  'xpLog',
  'badgeUnlocks',
]

export function validateBackup(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (typeof d.schemaVersion !== 'number' || d.schemaVersion > BACKUP_SCHEMA_VERSION) return false
  return REQUIRED_ARRAY_KEYS.every((key) => Array.isArray(d[key]))
}

export async function applyBackup(data: BackupData): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.modules,
      db.sessions,
      db.timerLogs,
      db.flashcards,
      db.accentLogs,
      db.settings,
      db.inputLogs,
      db.journalEntries,
      db.scenarioPrompts,
      db.drillAttempts,
      db.patterns,
      db.wordLookups,
      db.xpLog,
      db.badgeUnlocks,
    ],
    async () => {
      await Promise.all([
        db.modules.clear(),
        db.sessions.clear(),
        db.timerLogs.clear(),
        db.flashcards.clear(),
        db.accentLogs.clear(),
        db.settings.clear(),
        db.inputLogs.clear(),
        db.journalEntries.clear(),
        db.scenarioPrompts.clear(),
        db.drillAttempts.clear(),
        db.patterns.clear(),
        db.wordLookups.clear(),
        db.xpLog.clear(),
        db.badgeUnlocks.clear(),
      ])
      await Promise.all([
        db.modules.bulkAdd(data.modules),
        db.sessions.bulkAdd(data.sessions),
        db.timerLogs.bulkAdd(data.timerLogs),
        db.flashcards.bulkAdd(data.flashcards),
        db.accentLogs.bulkAdd(data.accentLogs),
        data.settings.length > 0 ? db.settings.bulkAdd(data.settings) : Promise.resolve(),
        db.inputLogs.bulkAdd(data.inputLogs),
        db.journalEntries.bulkAdd(data.journalEntries),
        db.scenarioPrompts.bulkAdd(data.scenarioPrompts),
        db.drillAttempts.bulkAdd(data.drillAttempts),
        db.patterns.bulkAdd(data.patterns),
        data.wordLookups.length > 0 ? db.wordLookups.bulkAdd(data.wordLookups) : Promise.resolve(),
        data.xpLog.length > 0 ? db.xpLog.bulkAdd(data.xpLog) : Promise.resolve(),
        data.badgeUnlocks.length > 0 ? db.badgeUnlocks.bulkAdd(data.badgeUnlocks) : Promise.resolve(),
      ])
    },
  )
}
