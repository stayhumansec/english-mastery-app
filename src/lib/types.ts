export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export type ModuleStatus = 'not_started' | 'in_progress' | 'done'

export interface RoadmapModule {
  id: string
  level: CefrLevel
  title: string
  description: string
  status: ModuleStatus
  notes: string
  order: number
  createdAt: number
}

export type ActivityCategory =
  | 'Grammar'
  | 'Listening'
  | 'Speaking'
  | 'Accent'
  | 'Flashcards'
  | 'Reading'
  | 'Vocabulary'
  | 'Other'

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'Grammar',
  'Vocabulary',
  'Listening',
  'Speaking',
  'Accent',
  'Flashcards',
  'Reading',
  'Other',
]

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  Grammar: '#3b82f6',
  Vocabulary: '#f59e0b',
  Listening: '#10b981',
  Speaking: '#ef4444',
  Accent: '#ec4899',
  Flashcards: '#8b5cf6',
  Reading: '#06b6d4',
  Other: '#6b7280',
}

export type RecurrenceFreq = 'none' | 'daily' | 'weekdays' | 'weekly'

export interface CalendarSession {
  id: string
  title: string
  category: ActivityCategory
  date: string // ISO date yyyy-mm-dd (first occurrence for recurring)
  startTime: string // HH:mm
  durationMinutes: number
  recurrence: RecurrenceFreq
  recurrenceUntil?: string // ISO date, inclusive
  completedDates: string[] // ISO dates that have been marked complete
  notes?: string
  createdAt: number
}

export interface TimerLog {
  id: string
  category: ActivityCategory
  label: string
  date: string // ISO date
  startedAt: number
  durationMinutes: number
  breakMinutes: number
  createdAt: number
}

export type DeckName =
  | 'Everyday Vocabulary'
  | 'Idioms & Phrasal Verbs'
  | 'Professional/Work English'
  | 'Pronunciation Minimal Pairs'
  | 'Sentence Patterns'
  | 'Collocations'

export const DECKS: DeckName[] = [
  'Everyday Vocabulary',
  'Idioms & Phrasal Verbs',
  'Professional/Work English',
  'Pronunciation Minimal Pairs',
  'Sentence Patterns',
  'Collocations',
]

export interface Flashcard {
  id: string
  deck: DeckName
  level: CefrLevel
  front: string
  back: string
  example: string
  audioNote?: string
  tags: string[]
  createdAt: number
  // SM-2 scheduling state
  repetitions: number
  easeFactor: number
  intervalDays: number
  dueDate: string // ISO date
  lastReviewedAt?: number
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'

export interface AccentLog {
  id: string
  date: string
  activity: string
  rating: 1 | 2 | 3 | 4 | 5
  notes: string
  createdAt: number
}

export interface AppSettings {
  id: 'app'
  remindersEnabled: boolean
  reminderTimes: string[] // HH:mm entries tied to schedule
  inactivityReminderEnabled: boolean
  inactivityReminderTime: string // HH:mm
  snoozeMinutes: number
  breakEnabled: boolean
  breakWorkMinutes: number
  breakDurationMinutes: number
}
