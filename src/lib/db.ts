import Dexie, { type Table } from 'dexie'
import type {
  AccentLog,
  AppSettings,
  CalendarSession,
  DrillAttempt,
  Flashcard,
  InputLogEntry,
  JournalEntry,
  Pattern,
  RoadmapModule,
  ScenarioPrompt,
  TimerLog,
} from './types'

export class EnglishMasteryDB extends Dexie {
  modules!: Table<RoadmapModule, string>
  sessions!: Table<CalendarSession, string>
  timerLogs!: Table<TimerLog, string>
  flashcards!: Table<Flashcard, string>
  accentLogs!: Table<AccentLog, string>
  settings!: Table<AppSettings, string>
  inputLogs!: Table<InputLogEntry, string>
  journalEntries!: Table<JournalEntry, string>
  scenarioPrompts!: Table<ScenarioPrompt, string>
  drillAttempts!: Table<DrillAttempt, string>
  patterns!: Table<Pattern, string>

  constructor() {
    super('english-mastery-db')
    this.version(1).stores({
      modules: 'id, level, order, status',
      sessions: 'id, date, category',
      timerLogs: 'id, date, category, createdAt',
      flashcards: 'id, deck, level, dueDate',
      accentLogs: 'id, date, createdAt',
      settings: 'id',
    })
    this.version(2).stores({
      modules: 'id, level, order, status',
      sessions: 'id, date, category',
      timerLogs: 'id, date, category, createdAt',
      flashcards: 'id, deck, level, dueDate, patternId',
      accentLogs: 'id, date, createdAt',
      settings: 'id',
      inputLogs: 'id, date, createdAt',
      journalEntries: 'id, date, createdAt',
      scenarioPrompts: 'id, level, category',
      drillAttempts: 'id, date, confidence, patternId, createdAt',
      patterns: 'id, level, category',
    })
  }
}

export const db = new EnglishMasteryDB()
