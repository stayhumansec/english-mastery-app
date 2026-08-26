import { db } from './db'
import { isoWeekKey } from './date'
import type { Pattern, RoadmapModule } from './types'

const KEYWORD_TO_CATEGORY: Array<[RegExp, string]> = [
  [/conditional/i, 'Conditionals'],
  [/phrasal/i, 'Phrasal Verbs'],
  [/reported/i, 'Reported Speech'],
  [/comparative|superlative/i, 'Comparatives & Superlatives'],
  [/article/i, 'Articles'],
  [/word order|question/i, 'Word Order'],
  [/perfect|past|present|tense|future/i, 'Verb Tenses'],
]

/** Best-effort link from a roadmap module's title to relevant Pattern
 * Library entries, so a grammar-shaped weekly focus can surface patterns
 * without requiring the roadmap and pattern library to share an explicit
 * foreign key. */
export function patternsForModule(module: RoadmapModule, patterns: Pattern[]): Pattern[] {
  const category = KEYWORD_TO_CATEGORY.find(([re]) => re.test(module.title))?.[1]
  if (!category) return []
  return patterns.filter((p) => p.category === category)
}

/** Returns this week's practical-focus module id, computing and persisting a
 * new pick (rotating through in-progress roadmap modules) if the stored
 * pick is stale or missing. Wrapped in a transaction so it can't double
 * write under concurrent calls (e.g. React StrictMode). */
export async function ensureWeeklyFocus(): Promise<string | null> {
  return db.transaction('rw', db.settings, db.modules, async () => {
    const weekKey = isoWeekKey()
    const settings = await db.settings.get('app')
    if (settings?.weeklyFocus?.weekKey === weekKey) return settings.weeklyFocus.moduleId

    const inProgress = (await db.modules.where('status').equals('in_progress').toArray()).sort(
      (a, b) => a.order - b.order,
    )
    if (inProgress.length === 0) return null

    let nextModule = inProgress[0]
    const lastModuleId = settings?.weeklyFocus?.moduleId
    if (lastModuleId) {
      const idx = inProgress.findIndex((m) => m.id === lastModuleId)
      if (idx !== -1) nextModule = inProgress[(idx + 1) % inProgress.length]
    }

    await db.settings.update('app', { weeklyFocus: { weekKey, moduleId: nextModule.id } })
    return nextModule.id
  })
}
