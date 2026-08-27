import {
  BookMarked,
  Flame,
  GraduationCap,
  Layers,
  Mic,
  Moon,
  PenLine,
  Rocket,
  Sparkles,
  Sunrise,
  Swords,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import type { BadgeCategory, CefrLevel, RoadmapModule } from './types'

/** Everything a badge's progress function might need, gathered once per
 * evaluation so each definition stays a pure, single-purpose function
 * over already-logged local data — no separate badge-tracking state. */
export interface BadgeContext {
  streak: number
  flashcardReviewCount: number
  modulesByLevel: Record<CefrLevel, RoadmapModule[]>
  accentLogsCount: number
  journalEntriesCount: number
  drillAttemptsCount: number
  earlyBirdCount: number
  nightOwlCount: number
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: BadgeCategory
  target: number
  progress: (ctx: BadgeContext) => number
}

function levelComplete(level: CefrLevel) {
  return (ctx: BadgeContext) => {
    const mods = ctx.modulesByLevel[level] ?? []
    if (mods.length === 0) return 0
    return mods.every((m) => m.status === 'done') ? 1 : 0
  }
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak
  { id: 'streak-3', name: 'Getting Started', description: 'Reach a 3-day streak', icon: Flame, category: 'streak', target: 3, progress: (ctx) => ctx.streak },
  { id: 'streak-7', name: 'Committed', description: 'Reach a 7-day streak', icon: Flame, category: 'streak', target: 7, progress: (ctx) => ctx.streak },
  { id: 'streak-30', name: 'Habit Formed', description: 'Reach a 30-day streak', icon: Flame, category: 'streak', target: 30, progress: (ctx) => ctx.streak },
  { id: 'streak-100', name: 'Unstoppable', description: 'Reach a 100-day streak', icon: Flame, category: 'streak', target: 100, progress: (ctx) => ctx.streak },

  // Vocabulary / flashcards
  { id: 'cards-50', name: 'First Steps', description: 'Review 50 flashcards', icon: Layers, category: 'vocabulary', target: 50, progress: (ctx) => ctx.flashcardReviewCount },
  { id: 'cards-250', name: 'Building Vocabulary', description: 'Review 250 flashcards', icon: Layers, category: 'vocabulary', target: 250, progress: (ctx) => ctx.flashcardReviewCount },
  { id: 'cards-1000', name: 'Word Master', description: 'Review 1000 flashcards', icon: BookMarked, category: 'vocabulary', target: 1000, progress: (ctx) => ctx.flashcardReviewCount },

  // Roadmap
  { id: 'first-lesson', name: 'First Lesson', description: 'Complete your first module', icon: GraduationCap, category: 'roadmap', target: 1, progress: (ctx) => Object.values(ctx.modulesByLevel).flat().filter((m) => m.status === 'done').length > 0 ? 1 : 0 },
  { id: 'a1-graduate', name: 'A1 Graduate', description: 'Complete every A1 module', icon: GraduationCap, category: 'roadmap', target: 1, progress: levelComplete('A1') },
  { id: 'halfway-there', name: 'Halfway There', description: 'Complete every B1 module', icon: Trophy, category: 'roadmap', target: 1, progress: levelComplete('B1') },
  { id: 'advanced-learner', name: 'Advanced Learner', description: 'Complete every C1 module', icon: Trophy, category: 'roadmap', target: 1, progress: levelComplete('C1') },
  { id: 'english-master', name: 'English Master', description: 'Complete every C2 module', icon: Rocket, category: 'roadmap', target: 1, progress: levelComplete('C2') },

  // Output
  { id: 'speaking-up', name: 'Speaking Up', description: 'Log 10 speaking prompts', icon: Mic, category: 'output', target: 10, progress: (ctx) => ctx.accentLogsCount },
  { id: 'journalist', name: 'Journalist', description: 'Write 30 journal entries', icon: PenLine, category: 'output', target: 30, progress: (ctx) => ctx.journalEntriesCount },
  { id: 'drill-sergeant', name: 'Drill Sergeant', description: 'Complete 100 sentence production drills', icon: Swords, category: 'output', target: 100, progress: (ctx) => ctx.drillAttemptsCount },

  // Consistency
  { id: 'early-bird', name: 'Early Bird', description: 'Log 5 sessions before 8 AM', icon: Sunrise, category: 'consistency', target: 5, progress: (ctx) => ctx.earlyBirdCount },
  { id: 'night-owl', name: 'Night Owl', description: 'Log 5 sessions after 9 PM', icon: Moon, category: 'consistency', target: 5, progress: (ctx) => ctx.nightOwlCount },
]

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  streak: 'Streak',
  vocabulary: 'Vocabulary',
  roadmap: 'Roadmap',
  output: 'Output',
  consistency: 'Consistency',
}

export const BADGE_CATEGORIES: BadgeCategory[] = ['streak', 'vocabulary', 'roadmap', 'output', 'consistency']

/** Icon used to represent an unlocked badge generically in celebratory
 * moments (toast/confetti) where the specific badge icon isn't rendered. */
export const BADGE_CELEBRATION_ICON = Sparkles
