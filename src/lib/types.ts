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
  /** Links a Grammar-in-Context style card (typically in "Sentence Patterns")
   * back to its full Pattern Library entry. */
  patternId?: string
  // SM-2 scheduling state
  repetitions: number
  easeFactor: number
  intervalDays: number
  dueDate: string // ISO date
  lastReviewedAt?: number
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy'

export type ScenarioCategory = 'everyday' | 'professional' | 'storytelling' | 'debate'

export const SCENARIO_CATEGORIES: ScenarioCategory[] = [
  'everyday',
  'professional',
  'storytelling',
  'debate',
]

export interface ScenarioPrompt {
  id: string
  level: CefrLevel
  category: ScenarioCategory
  prompt: string
}

export interface AccentLog {
  id: string
  date: string
  activity: string
  rating: 1 | 2 | 3 | 4 | 5
  notes: string
  createdAt: number
  /** Set when this entry came from the scenario prompt generator. */
  scenarioPromptId?: string
  scenarioCategory?: ScenarioCategory
  /** Self-timed practice length; no audio is recorded or stored. */
  durationSeconds?: number
}

export type InputType = 'article' | 'podcast' | 'video' | 'book'
export type InputDifficulty = 'easy' | 'comfortable' | 'challenging'

export interface InputLogItem {
  text: string
  note?: string
  /** Set once this word/phrase has been sent to a flashcard deck. */
  sentToFlashcardId?: string
}

export interface InputLogEntry {
  id: string
  date: string
  title: string
  type: InputType
  difficulty: InputDifficulty
  durationMinutes: number
  items: InputLogItem[]
  createdAt: number
}

export interface JournalEntry {
  id: string
  date: string
  text: string
  wordCount: number
  /** Optional free-text tag: which grammar pattern or vocab this entry
   * deliberately tried to use. */
  tag?: string
  patternId?: string
  createdAt: number
}

export type DrillConfidence = 'confident' | 'unsure'

export interface DrillAttempt {
  id: string
  date: string
  patternId?: string
  promptContext: string
  sentence: string
  confidence: DrillConfidence
  createdAt: number
}

/** The fixed color-coded roles used across the Pattern Library so the same
 * color always means the same grammatical role. */
export type PatternRole = 'subject' | 'verb' | 'object'

export const PATTERN_ROLE_COLORS: Record<PatternRole, string> = {
  subject: '#3b82f6', // blue
  verb: '#f59e0b', // orange
  object: '#10b981', // green
}

export const PATTERN_ROLE_LABELS: Record<PatternRole, string> = {
  subject: 'Subject',
  verb: 'Verb / auxiliary',
  object: 'Object / complement',
}

/** One piece of text within a template or example. Segments without a role
 * render as plain, unhighlighted text (connectors, punctuation, etc.). */
export interface PatternSegment {
  text: string
  role?: PatternRole
}

export type ExampleContext = 'everyday' | 'professional' | 'storytelling'

export interface PatternExample {
  context: ExampleContext
  segments: PatternSegment[]
}

/** A token in a "Spot the Pattern" recognition paragraph. isTarget marks the
 * words/phrases that belong to the pattern being drilled. */
export interface RecognitionToken {
  text: string
  isTarget: boolean
}

export interface Pattern {
  id: string
  name: string
  level: CefrLevel
  category: string
  structureTemplate: PatternSegment[]
  examples: PatternExample[]
  commonMistake: string
  contrastWrong: string
  contrastNote: string
  recognitionParagraph?: RecognitionToken[]
  createdAt: number
}

export interface WeeklyFocus {
  weekKey: string // ISO-ish "YYYY-Www"
  moduleId: string
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
  weeklyFocus?: WeeklyFocus
}
