export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** One bright, distinct color per CEFR level — reused for level badges,
 * roadmap section accents, and progress bars so a level reads the same
 * color everywhere in the app. */
export const LEVEL_COLORS: Record<CefrLevel, string> = {
  A1: '#22c55e', // green
  A2: '#14b8a6', // teal
  B1: '#3b82f6', // blue
  B2: '#a855f7', // purple
  C1: '#f97316', // orange
  C2: '#ec4899', // pink
}

/** One bright, distinct color per feature/nav destination, used for
 * sidebar icons, dashboard tiles and section accents so navigation feels
 * colorful and consistent at a glance. */
export type FeatureKey =
  | 'home'
  | 'roadmap'
  | 'calendar'
  | 'timer'
  | 'flashcards'
  | 'input'
  | 'journal'
  | 'drills'
  | 'patterns'
  | 'accent'
  | 'settings'

export const FEATURE_COLORS: Record<FeatureKey, string> = {
  home: '#22c55e',
  roadmap: '#22c55e',
  calendar: '#3b82f6',
  timer: '#f97316',
  flashcards: '#f97316',
  input: '#14b8a6',
  journal: '#3b82f6',
  drills: '#a855f7',
  patterns: '#a855f7',
  accent: '#ec4899',
  settings: '#6b7280',
}

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
  Grammar: '#a855f7',
  Vocabulary: '#f59e0b',
  Listening: '#14b8a6',
  Speaking: '#ec4899',
  Accent: '#ec4899',
  Flashcards: '#f97316',
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

/** One bright color per deck so the study/manage screens read as
 * distinct, colorful decks rather than identical gray cards. */
export const DECK_COLORS: Record<DeckName, string> = {
  'Everyday Vocabulary': '#14b8a6',
  'Idioms & Phrasal Verbs': '#a855f7',
  'Professional/Work English': '#3b82f6',
  'Pronunciation Minimal Pairs': '#ec4899',
  'Sentence Patterns': '#f97316',
  Collocations: '#facc15',
}

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
