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
  // Consolidated top-level nav destinations (Part 1 IA restructure) — the
  // sub-feature keys above remain in use for tab/section accents *within*
  // these hubs.
  | 'learn'
  | 'practice'
  | 'journalSpeaking'
  | 'progress'

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
  learn: '#22c55e',
  practice: '#a855f7',
  journalSpeaking: '#ec4899',
  progress: '#facc15',
}

/** Self-selected difficulty, independent of CEFR level — so a learner can
 * pick what feels right that day rather than being locked strictly to
 * sequence (mirrors the BBC Learning English flexible-tagging approach). */
export type LessonDifficulty = 'easy' | 'medium' | 'hard'

export const DIFFICULTY_COLORS: Record<LessonDifficulty, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
}

export const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
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
  /** Set once the learner has opened this module's lesson content. */
  lessonViewed?: boolean
  /** Best score (0-100) achieved on this lesson's mini-quiz. Modules with
   * quiz content can only be marked "done" once this clears the pass
   * threshold — see QUIZ_PASS_THRESHOLD in lessonContent.ts. */
  quizBestScore?: number
  /** Why this module matters for this learner's own work, when a genuine
   * connection exists (e.g. a cybersecurity/professional angle) — shown as
   * a small aside on the lesson page. Left unset where none applies. */
  relevanceNote?: string | null
  /** Timestamp this module's staleness timer was last reset (completion, or
   * a later refresh) — used by the retention safety net to flag modules
   * that haven't been touched in a while. Falls back to createdAt/done
   * time when unset. */
  lastPracticedAt?: number
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

export type FrequencyTier = 'top1000' | 'top3000' | 'top5000' | 'beyond'

export const FREQUENCY_TIERS: FrequencyTier[] = ['top1000', 'top3000', 'top5000', 'beyond']

export const FREQUENCY_TIER_LABELS: Record<FrequencyTier, string> = {
  top1000: 'Top 1000',
  top3000: 'Top 3000',
  top5000: 'Top 5000',
  beyond: 'Beyond 5000',
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
  /** Word-frequency tier (COCA-style), for prioritizing high-frequency
   * vocabulary. null/unset where frequency doesn't meaningfully apply
   * (idioms, grammar-in-context cards) or for user-added cards that
   * haven't set one. */
  frequencyTier?: FrequencyTier | null
  /** Common collocations this word appears in, e.g. ["make a decision"].
   * Shown as small chips on the back of the card when non-empty. */
  collocations?: string[]
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

/** Three yes/no/not-sure self-checks shown after the model-answer reveal.
 * A "no" or "unsure" on any of them counts toward that pattern's
 * weak-spot score (see lib/weakSpots.ts). */
export type SelfCheckAnswer = 'yes' | 'no' | 'unsure'

export interface DrillSelfCheck {
  grammarCorrect: SelfCheckAnswer
  soundsNatural: SelfCheckAnswer
  rightRegister: SelfCheckAnswer
}

export interface DrillAttempt {
  id: string
  date: string
  patternId?: string
  promptContext: string
  sentence: string
  confidence: DrillConfidence
  createdAt: number
  /** Self-scoring rubric, filled in after the model answer is revealed.
   * Unset for attempts logged before this feature existed. */
  selfCheck?: DrillSelfCheck
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
  /** A one-line "why this works" rule, shown after Spot-the-Pattern
   * attempts and on the back of linked Grammar-in-Context flashcards. */
  ruleExplanation: string
  recognitionParagraph?: RecognitionToken[]
  createdAt: number
  /** Why this pattern matters for this learner's own work, when a genuine
   * connection exists. Left unset where none applies. */
  relevanceNote?: string | null
}

export interface QuizQuestionMCQ {
  type: 'mcq'
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface QuizQuestionFill {
  type: 'fill'
  prompt: string
  /** Any of these (case-insensitive, trimmed) counts as correct. */
  acceptedAnswers: string[]
  explanation: string
}

export type QuizQuestion = QuizQuestionMCQ | QuizQuestionFill

/** A short, pre-written "mini story" for the Comprehensible Input starter
 * library (LingQ-style): a handful of passages per level that deliberately
 * reuse a small, recurring set of core vocabulary across the set, with a
 * click-to-reveal glossary. Content lives in code (src/lib/miniStorySeed.ts),
 * not the database — only per-word lookup state is persisted. */
export interface MiniStory {
  id: string
  level: CefrLevel
  difficulty: LessonDifficulty
  title: string
  text: string
  /** Lowercase, punctuation-stripped word -> its meaning in this story. */
  glossary: Record<string, string>
}

/** Tracks how many times the learner has clicked a given word across all
 * mini stories, and whether they've already sent it to flashcards — so
 * repeated exposure to the same word across passages is visible. Keyed by
 * the lowercase word itself. */
export interface WordLookup {
  word: string
  lookedUpCount: number
  addedFlashcardId?: string
  lastSeenAt: number
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
  /** Set once the first-launch onboarding flow has been completed or
   * skipped, so it never shows again. */
  onboardingCompleted?: boolean
  /** The CEFR level picked (or confirmed) during onboarding. Purely
   * informational — doesn't gate anything in the roadmap. */
  startingLevel?: CefrLevel
  /** Whether to auto-show the Weekly Recap once per week. Default off. */
  weeklyRecapAutoShow?: boolean
  /** ISO week key ("YYYY-Www") the recap was last auto-shown for, so it
   * only pops up once per week even across sessions. */
  weeklyRecapLastShown?: string
}

/** One source of XP, always traceable back to the real action that
 * triggered it (a specific flashcard, module, journal entry, drill...). */
export type XpActivityType =
  | 'flashcard_review'
  | 'flashcard_review_easy'
  | 'drill_sentence'
  | 'drill_spot_pattern'
  | 'journal_entry'
  | 'journal_entry_short'
  | 'speaking_prompt'
  | 'input_log_entry'
  | 'module_complete'
  | 'level_complete'
  | 'daily_login'

export interface XpLogEntry {
  id: string
  timestamp: number
  activityType: XpActivityType
  xpAwarded: number
  /** The specific record that triggered this XP (flashcard id, module id,
   * journal entry id, drill attempt id...). Undefined only for activity
   * types with no single source record (e.g. daily_login). */
  sourceId?: string
}

export type BadgeCategory = 'streak' | 'vocabulary' | 'roadmap' | 'output' | 'consistency'

/** Persisted unlock state for one badge. The badge's name/description/icon/
 * criteria live in code (lib/badgeDefinitions.ts) — this table only tracks
 * whether and when it unlocked, so there's no duplicate state to drift out
 * of sync with the definitions. */
export interface BadgeUnlock {
  id: string
  category: BadgeCategory
  unlockedAt: number | null
}
