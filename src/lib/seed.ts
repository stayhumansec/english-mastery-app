import { v4 as uuid } from 'uuid'
import { db } from './db'
import { newCardScheduleDefaults } from './sm2'
import type { CefrLevel, DeckName, Flashcard, RoadmapModule } from './types'

const ROADMAP_SEED: Array<[CefrLevel, Array<[string, string]>]> = [
  [
    'A1',
    [
      ['Basic Greetings', 'Hello, goodbye, introducing yourself and others.'],
      ['Numbers, Dates & Time', 'Counting, telling time, days, months.'],
      ['Simple Present & To Be', 'Core sentence structure and the verb "to be".'],
      ['Everyday Survival Vocabulary', 'Food, directions, shopping, family.'],
    ],
  ],
  [
    'A2',
    [
      ['Past Simple & Past Continuous', 'Talking about past events and routines.'],
      ['Comparatives & Superlatives', 'Comparing people, places and things.'],
      ['Making Plans (Future Forms)', '"going to", "will", present continuous for future.'],
      ['Everyday Conversations', 'Small talk, phone calls, simple opinions.'],
    ],
  ],
  [
    'B1',
    [
      ['Present Perfect vs Past Simple', 'Experience, unfinished time, life events.'],
      ['Conditionals (Zero/First/Second)', 'Real and hypothetical situations.'],
      ['Phrasal Verbs — Everyday Life', 'Common two-word verbs used daily.'],
      ['Describing Opinions & Preferences', 'Agreeing, disagreeing, giving reasons.'],
    ],
  ],
  [
    'B2',
    [
      ['Idioms & Phrasal Verbs', 'Expanding fluency with common idiomatic language.'],
      ['Passive Voice & Reported Speech', 'Formal structures for news, reports, retelling.'],
      ['Advanced Conditionals & Wish', 'Third conditional, mixed conditionals, regret.'],
      ['Debating & Persuasion', 'Structuring arguments, linking words, discussion.'],
    ],
  ],
  [
    'C1',
    [
      ['Register & Nuance', 'Formal vs informal tone, softening/hedging language.'],
      ['Collocations & Natural Phrasing', 'Sounding natural rather than "textbook".'],
      ['Advanced Listening — Native Speed', 'Podcasts, interviews, unscripted speech.'],
      ['Professional & Work English', 'Meetings, emails, presentations.'],
    ],
  ],
  [
    'C2',
    [
      ['Near-Native Idiomatic Fluency', 'Cultural references, wordplay, subtle humor.'],
      ['Accent Refinement', 'Connected speech, intonation, stress patterns.'],
      ['Nuanced Writing & Style', 'Varying tone and register in writing convincingly.'],
      ['Spontaneous Unscripted Speaking', 'Debate, storytelling, thinking in English.'],
    ],
  ],
]

const FLASHCARD_SEED: Array<Omit<Flashcard, 'id' | 'createdAt' | keyof ReturnType<typeof newCardScheduleDefaults>>> = [
  // Everyday Vocabulary
  { deck: 'Everyday Vocabulary', level: 'A1', front: 'errand', back: 'a short trip to do a specific task', example: 'I need to run a few errands before lunch.', tags: ['noun'] },
  { deck: 'Everyday Vocabulary', level: 'A2', front: 'commute', back: 'to travel regularly to and from work', example: 'She commutes to the city by train every day.', tags: ['verb'] },
  { deck: 'Everyday Vocabulary', level: 'A2', front: 'exhausted', back: 'very tired', example: 'I was exhausted after the long shift.', tags: ['adjective'] },
  // Idioms & Phrasal Verbs
  { deck: 'Idioms & Phrasal Verbs', level: 'B1', front: 'give up', back: 'to stop trying', example: "Don't give up, you're almost there.", tags: ['phrasal verb'] },
  { deck: 'Idioms & Phrasal Verbs', level: 'B2', front: 'hit the books', back: 'to study hard', example: 'I have an exam tomorrow, so I need to hit the books.', tags: ['idiom'] },
  { deck: 'Idioms & Phrasal Verbs', level: 'B2', front: 'under the weather', back: 'feeling slightly ill', example: "I'm a bit under the weather today.", tags: ['idiom'] },
  { deck: 'Idioms & Phrasal Verbs', level: 'B1', front: 'look forward to', back: 'to feel excited about something in the future', example: 'I look forward to hearing from you.', tags: ['phrase'] },
  // Professional/Work English
  { deck: 'Professional/Work English', level: 'B2', front: 'circle back', back: "to return to a topic or person later", example: "Let's circle back to this next week.", tags: ['workplace'] },
  { deck: 'Professional/Work English', level: 'B2', front: 'touch base', back: 'to make brief contact to check on progress', example: 'Can we touch base tomorrow morning?', tags: ['workplace'] },
  { deck: 'Professional/Work English', level: 'C1', front: 'bandwidth', back: 'capacity/time to take on more work', example: "I don't have the bandwidth for another project right now.", tags: ['workplace'] },
  // Pronunciation Minimal Pairs
  { deck: 'Pronunciation Minimal Pairs', level: 'A2', front: 'ship / sheep', back: '/ɪ/ vs /iː/ — short vs long vowel', example: 'The ship carried a ship-load of sheep.', tags: ['minimal pair'] },
  { deck: 'Pronunciation Minimal Pairs', level: 'A2', front: 'think / sink', back: '/θ/ vs /s/ — dental fricative vs alveolar', example: 'I think the boat will sink.', tags: ['minimal pair'] },
  { deck: 'Pronunciation Minimal Pairs', level: 'B1', front: 'live / leave', back: '/ɪ/ vs /iː/', example: 'I live here, but I will leave tomorrow.', tags: ['minimal pair'] },
  { deck: 'Pronunciation Minimal Pairs', level: 'B1', front: 'bat / bad', back: 'final /t/ (unvoiced) vs /d/ (voiced)', example: 'He hit the ball with the bat, which was bad luck.', tags: ['minimal pair'] },
  // Sentence Patterns
  { deck: 'Sentence Patterns', level: 'A2', front: 'It takes ___ (time) to ___', back: 'pattern for describing duration of an action', example: 'It takes twenty minutes to walk there.', tags: ['pattern'] },
  { deck: 'Sentence Patterns', level: 'B1', front: 'I used to ___', back: 'pattern for past habits that no longer happen', example: 'I used to play tennis every weekend.', tags: ['pattern'] },
  // Collocations
  { deck: 'Collocations', level: 'B1', front: 'make a decision', back: 'not "take" — the correct collocation with decision', example: 'We need to make a decision by Friday.', tags: ['collocation'] },
  { deck: 'Collocations', level: 'B2', front: 'heavy traffic', back: '"heavy", not "big/strong", collocates with traffic', example: 'There was heavy traffic on the way home.', tags: ['collocation'] },
]

export async function seedIfEmpty(): Promise<void> {
  // Run as a single transaction so two concurrent calls (e.g. React
  // StrictMode's double-invoked effect in dev) can't both observe an empty
  // table and double-insert the seed data.
  await db.transaction('rw', db.modules, db.flashcards, db.settings, async () => {
    const [moduleCount, flashcardCount, settings] = await Promise.all([
      db.modules.count(),
      db.flashcards.count(),
      db.settings.get('app'),
    ])

    if (moduleCount === 0) {
      const modules: RoadmapModule[] = []
      let order = 0
      for (const [level, topics] of ROADMAP_SEED) {
        for (const [title, description] of topics) {
          modules.push({
            id: uuid(),
            level,
            title,
            description,
            status: 'not_started',
            notes: '',
            order: order++,
            createdAt: Date.now(),
          })
        }
      }
      await db.modules.bulkAdd(modules)
    }

    if (flashcardCount === 0) {
      const cards: Flashcard[] = FLASHCARD_SEED.map((c) => ({
        ...c,
        id: uuid(),
        createdAt: Date.now(),
        ...newCardScheduleDefaults(),
      }))
      await db.flashcards.bulkAdd(cards)
    }

    if (!settings) {
      await db.settings.put({
        id: 'app',
        remindersEnabled: false,
        reminderTimes: ['07:00', '20:00'],
        inactivityReminderEnabled: true,
        inactivityReminderTime: '20:00',
        snoozeMinutes: 15,
        breakEnabled: true,
        breakWorkMinutes: 25,
        breakDurationMinutes: 5,
      })
    }
  })
}

export function deckList(): DeckName[] {
  return FLASHCARD_SEED.map((c) => c.deck).filter((v, i, a) => a.indexOf(v) === i) as DeckName[]
}
