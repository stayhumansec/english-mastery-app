import type { MiniStory } from './types'

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Starter Comprehensible Input library (LingQ-style mini stories): a
 * handful of short passages per level built around one recurring character,
 * deliberately reusing a small, overlapping set of core vocabulary across
 * the set so the same words resurface in new contexts. Static content,
 * not user-editable — only per-word lookup state persists to the database. */
export const MINI_STORY_SEED: Array<Omit<MiniStory, 'id'>> = [
  // A1 — Anna's daily life
  {
    level: 'A1',
    difficulty: 'easy',
    title: "Anna's Morning",
    text: 'Anna wakes up at seven. She makes coffee and toast. She reads the news for ten minutes. Then she walks to the bus stop. The bus is late again.',
    glossary: {
      wakes: 'to stop sleeping and become awake',
      coffee: 'a hot drink made from roasted beans',
      toast: 'bread cooked until brown and crisp',
      reads: 'to look at and understand written words',
      walks: 'to move on foot',
      bus: 'a large vehicle that carries many passengers',
      late: 'arriving after the expected time',
    },
  },
  {
    level: 'A1',
    difficulty: 'easy',
    title: 'A Trip to the Shop',
    text: 'After work, Anna walks to the shop. She buys milk, bread, and apples. The shop is busy today. She pays and says thank you. Then she walks home.',
    glossary: {
      shop: 'a small store where you buy things',
      buys: 'to get something by paying money for it',
      milk: 'a white drink from cows, used with coffee or cereal',
      busy: 'having a lot of people or activity',
      pays: 'to give money for something',
      home: 'the place where you live',
    },
  },
  {
    level: 'A1',
    difficulty: 'medium',
    title: 'Dinner with a Friend',
    text: 'In the evening, Anna calls her friend Marco. They meet at a small restaurant. Marco orders soup, and Anna orders fish. They talk about their week and laugh a lot. It is a nice evening.',
    glossary: {
      evening: 'the part of the day between afternoon and night',
      calls: 'to telephone someone',
      friend: 'a person you like and know well',
      restaurant: 'a place where you pay to eat a meal',
      orders: 'to ask for food or drink at a restaurant',
      talk: 'to speak with someone',
      laugh: 'to make sounds showing you find something funny',
    },
  },
  {
    level: 'A1',
    difficulty: 'medium',
    title: 'A Rainy Day',
    text: 'It rains all morning. Anna stays home and reads a book. Her cat sleeps on the sofa. At noon, she makes soup for lunch. The rain stops in the afternoon.',
    glossary: {
      rains: 'water falls from the sky',
      stays: 'to remain in a place',
      sleeps: 'to be in a state of rest with your eyes closed',
      sofa: 'a long soft seat for more than one person',
      noon: 'twelve o\'clock in the middle of the day',
      lunch: 'a meal eaten in the middle of the day',
      afternoon: 'the part of the day between noon and evening',
    },
  },

  // A2 — Anna starts a new chapter
  {
    level: 'A2',
    difficulty: 'medium',
    title: 'The New Job',
    text: "Last month, Anna started a new job at a design company. Her new office is bigger than her old one, and her colleagues are very friendly. On her first day, she felt nervous, but everyone welcomed her warmly. Now she enjoys her work much more than before.",
    glossary: {
      started: 'began doing something',
      colleagues: 'people you work with',
      nervous: 'worried or anxious about something',
      welcomed: 'greeted someone in a friendly way',
      enjoys: 'gets pleasure from something',
    },
  },
  {
    level: 'A2',
    difficulty: 'medium',
    title: 'Planning a Trip',
    text: 'Anna and Marco are planning a trip to the coast next weekend. They will drive there on Saturday morning and stay in a small hotel near the beach. Marco is going to bring his camera because the sunsets are beautiful there. They are both looking forward to it.',
    glossary: {
      planning: 'making decisions about something in the future',
      coast: 'land next to the sea',
      drive: 'to travel by car, controlling it yourself',
      camera: 'a device used to take photographs',
      sunsets: 'the times when the sun goes down each evening',
      'looking forward to': 'feeling excited about something that will happen',
    },
  },
  {
    level: 'A2',
    difficulty: 'hard',
    title: 'A Difficult Decision',
    text: "Anna had to make a difficult decision last week. She was offered a new job in another city, but she didn't want to leave her friends. After thinking about it for days, she decided to stay. She believes the right opportunity will come again.",
    glossary: {
      decision: 'a choice you make after thinking',
      offered: 'given a chance to have or do something',
      leave: 'to go away from a place or person',
      decided: 'made a choice',
      opportunity: 'a chance to do something good',
    },
  },

  // B1 — Anna, further along
  {
    level: 'B1',
    difficulty: 'medium',
    title: 'Looking Back',
    text: "Anna has lived in this city for five years now. She has changed a lot since she arrived — she has learned the language, made new friends, and become more confident. If she hadn't taken that first job, she probably wouldn't be here today. She's grateful for how things turned out.",
    glossary: {
      'has lived': 'present perfect — an action that started in the past and continues now',
      'has changed': 'present perfect — a change that has happened over time up to now',
      confident: 'sure of yourself and your abilities',
      grateful: 'feeling thankful',
      'turned out': 'happened in the end, often unexpectedly',
    },
  },
  {
    level: 'B1',
    difficulty: 'hard',
    title: 'An Unexpected Visitor',
    text: "One evening, someone knocked on Anna's door. She wasn't expecting anyone, so she was surprised to see her old university friend standing there. They hadn't spoken in years, but it felt like no time had passed at all. They talked until midnight, catching up on everything.",
    glossary: {
      knocked: 'hit a door lightly to get attention',
      expecting: 'thinking something or someone will arrive',
      surprised: 'feeling unexpected emotion because of something you didn\'t predict',
      'catching up': 'talking about what has happened since you last saw someone',
    },
  },
  {
    level: 'B1',
    difficulty: 'medium',
    title: 'Balancing Work and Life',
    text: 'These days, Anna tries to balance her career with time for herself. If she works too much, she gets exhausted and irritable. So every weekend, she makes sure to relax, see friends, or go for a long walk. She has realized that rest makes her more productive, not less.',
    glossary: {
      balance: 'to give the right amount of time and attention to different things',
      career: 'the jobs you have over a long period of your working life',
      exhausted: 'extremely tired',
      irritable: 'easily annoyed or angered',
      realized: 'became aware of or understood something',
      productive: 'able to produce a good amount of work',
    },
  },
]

/** Stories with stable, deterministic ids (level + title slug) attached —
 * this is what the reading UI actually consumes. */
export const MINI_STORIES: MiniStory[] = MINI_STORY_SEED.map((s) => ({
  ...s,
  id: `${s.level.toLowerCase()}-${slugify(s.title)}`,
}))
