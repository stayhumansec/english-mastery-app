import Dexie, { type Table } from 'dexie'
import type {
  AccentLog,
  AppSettings,
  CalendarSession,
  Flashcard,
  RoadmapModule,
  TimerLog,
} from './types'

export class EnglishMasteryDB extends Dexie {
  modules!: Table<RoadmapModule, string>
  sessions!: Table<CalendarSession, string>
  timerLogs!: Table<TimerLog, string>
  flashcards!: Table<Flashcard, string>
  accentLogs!: Table<AccentLog, string>
  settings!: Table<AppSettings, string>

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
  }
}

export const db = new EnglishMasteryDB()
