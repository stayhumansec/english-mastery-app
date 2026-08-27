import { Clock, Hand, ShoppingBag, SpellCheck, type LucideIcon } from 'lucide-react'
import type { DeckName, ExampleContext, LessonDifficulty, QuizQuestion } from './types'

/** Minimum quiz score (0-100) required before a lesson-backed module can be
 * marked "done". */
export const QUIZ_PASS_THRESHOLD = 70

export interface LessonExample {
  context: ExampleContext
  text: string
}

export interface LessonContent {
  /** A themed icon shown next to the lesson title. */
  icon: LucideIcon
  /** Self-labeled difficulty (independent of CEFR level) so the learner can
   * pick what feels right that day. */
  difficulty: LessonDifficulty
  /** A short guided-discovery question shown alongside the examples,
   * before the rule is revealed — prompts the learner to notice the
   * pattern themselves first (British Council "guided discovery" method). */
  guidedQuestion: string
  /** Short paragraphs revealed only after the learner engages with the
   * examples and guided question — confirmation of the rule, not the
   * starting point. A relatable framing first, then the underlying rule,
   * the way a good teacher would explain it. */
  concept: string[]
  examples: LessonExample[]
  commonMistakes: string[]
  quiz: QuizQuestion[]
  /** Resolved at render time against the Pattern Library by exact name
   * match, to link the lesson's practice section to a drill + Spot the
   * Pattern warm-up. */
  linkPatternName?: string
  linkDecks?: DeckName[]
}

/** Keyed by the exact roadmap module title (see ROADMAP_SEED in seed.ts).
 * Only modules with an entry here get full lesson treatment (concept,
 * examples, quiz, computed completion); modules without one fall back to
 * a "content coming soon" shell with the manual status dropdown, so the
 * rest of the curriculum stays usable while more lessons are written. */
export const LESSON_CONTENT: Record<string, LessonContent> = {
  'Basic Greetings': {
    icon: Hand,
    difficulty: 'easy',
    guidedQuestion: 'Look at the examples below before reading anything else. Notice how "Nice to meet you" and "Take care" are used — what do you think determines when each greeting or goodbye is appropriate?',
    concept: [
      'Imagine walking into a coffee shop for the first time. The barista smiles and says, "Hi, how are you?" You freeze — do you actually answer the question, or is it just being friendly? In English, small greetings like this are less about literally asking how you feel and more about warmth. Learning to greet people naturally is your first real step into English conversation.',
      'English greetings change with the time of day: "good morning" before noon, "good afternoon" until evening, "good evening" after that — while "hi" and "hello" work any time, with "hi" being the more casual choice.',
      'When you meet someone, "Nice to meet you" is for the very first time you meet them — not every time you see them again. That mix-up is one of the most common ones learners make.',
      'Saying goodbye has its own toolkit too: "bye," "see you later," and "take care" are casual; "goodbye" is more neutral or formal.',
    ],
    examples: [
      { context: 'everyday', text: 'Hi! How are you doing today?' },
      { context: 'everyday', text: 'Good morning! Did you sleep well?' },
      { context: 'professional', text: 'Good afternoon, thank you for joining the call.' },
      { context: 'storytelling', text: "She smiled and said, \"Nice to meet you — I've heard so much about you.\"" },
      { context: 'everyday', text: 'Take care! See you next week.' },
    ],
    commonMistakes: [
      'Giving a long, detailed answer to "How are you?" — a short "Good, thanks! And you?" is what\'s expected.',
      'Saying "Nice to meet you" to someone you already know — use "Nice to see you" instead.',
      'Using "Good night" as a greeting when arriving somewhere — it\'s only for leaving or going to bed.',
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: "Someone says \"Nice to meet you\" to a friend they already know well. What's the mistake?",
        options: [
          "Nothing, it's fine",
          'It should be "Nice to see you" — "nice to meet you" is only for a first introduction',
          'It should be "Nice meeting you"',
          "It's too formal",
        ],
        correctIndex: 1,
        explanation: '"Nice to meet you" announces a first introduction; once you know someone, "Nice to see you" is the natural phrase.',
      },
      {
        type: 'fill',
        prompt: 'Complete the greeting used before noon: "Good ____."',
        acceptedAnswers: ['morning'],
        explanation: '"Good morning" is used any time before midday.',
      },
      {
        type: 'mcq',
        prompt: 'Which is the best short reply to "How are you?"',
        options: ['I woke up at 7, had breakfast, then...', 'Good, thanks! And you?', 'Why do you ask?', "I don't know"],
        correctIndex: 1,
        explanation: 'A brief, friendly reply keeps small talk moving naturally.',
      },
      {
        type: 'mcq',
        prompt: 'When would you say "Good night"?',
        options: [
          'When you arrive somewhere in the evening',
          'When you are leaving or going to sleep',
          'As a morning greeting',
          'When meeting someone for the first time',
        ],
        correctIndex: 1,
        explanation: '"Good night" is a farewell, not a greeting — you say it when leaving or heading to bed.',
      },
    ],
    linkDecks: ['Everyday Vocabulary'],
  },

  'Numbers, Dates & Time': {
    icon: Clock,
    difficulty: 'medium',
    guidedQuestion: "Read the examples below first. Look closely at the small words right before each time expression — \"at half past two,\" \"for the twenty-third of March.\" What pattern do you notice about which little word (at/on/in) goes with which kind of time?",
    concept: [
      'Numbers and time can feel like "just memorization," but they\'re some of the most-used words in daily life — sharing your phone number, agreeing on a meeting time, or understanding a price all depend on them.',
      'For time, English usually says the hour first: "three thirty" for 3:30, or the more traditional "half past three." You\'ll also hear "quarter past" and "quarter to" for :15 and :45.',
      'Dates trip learners up because the US and most of the world write them differently: Americans say month/day/year (03/21/2026), while the UK and most other countries say day/month/year (21/03/2026). When in doubt, just say the date in words: "March twenty-first."',
      'Ordinal numbers (first, second, third...) are for dates and rankings; cardinal numbers (one, two, three...) are for counting and clock times.',
    ],
    examples: [
      { context: 'everyday', text: 'My phone number is oh-two-one, five-five-five, one-two-three-four.' },
      { context: 'everyday', text: "Let's meet at half past two." },
      { context: 'professional', text: 'The meeting is scheduled for the twenty-third of March.' },
      { context: 'storytelling', text: 'It was quarter to midnight when the train finally arrived.' },
      { context: 'everyday', text: 'That will be nineteen ninety-nine, please.' },
    ],
    commonMistakes: [
      'Writing a date in digits without knowing which format the listener expects (day/month vs. month/day) — say it in words to avoid confusion.',
      'Mixing up "in," "on," and "at" for time: use "at" for clock times, "on" for days, "in" for months and years.',
      'Confusing ordinal and cardinal numbers when giving a date ("March two" instead of "March second").',
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: 'Which preposition goes with a clock time?',
        options: ['on 3:00', 'in 3:00', 'at 3:00', 'of 3:00'],
        correctIndex: 2,
        explanation: '"At" is used with specific clock times: at 3:00, at noon.',
      },
      {
        type: 'fill',
        prompt: "3:30 is commonly said as \"three ____.\"",
        acceptedAnswers: ['thirty'],
        explanation: '"Three thirty" is the everyday way to say 3:30 (also "half past three").',
      },
      {
        type: 'mcq',
        prompt: 'How would you say "March 2nd" out loud?',
        options: ['March two', 'March second', 'March twice', 'March number two'],
        correctIndex: 1,
        explanation: 'Dates use ordinal numbers: first, second, third — "March second."',
      },
      {
        type: 'mcq',
        prompt: 'Which preposition goes with a month?',
        options: ['at March', 'on March', 'in March', 'of March'],
        correctIndex: 2,
        explanation: '"In" is used with months and years: in March, in 2026.',
      },
    ],
    linkDecks: ['Everyday Vocabulary'],
  },

  'Simple Present & To Be': {
    icon: SpellCheck,
    difficulty: 'easy',
    guidedQuestion: 'Before reading the explanation, look at the examples below. Compare "I am," "She is," and "They are" — what changes, and what stays the same? What do you think decides which form to use?',
    concept: [
      'The verb "to be" (am/is/are) is the most important verb in English — it\'s how you say who you are, how you feel, and what things are like: "I am tired," "She is a teacher," "They are ready."',
      'Unlike most verbs, "to be" doesn\'t need a helper word to make questions or negatives. You don\'t say "Do you is happy?" — you simply flip the order: "Are you happy?" and add "not" for the negative: "I am not happy."',
      'The simple present, for other verbs, describes habits, facts, and routines — things generally true, not just happening right now: "I work in a hospital," "The sun rises in the east." Remember the -s/-es ending for he/she/it.',
      'A lot of learners translate "to be" literally from their first language, which creates sentences that sound almost right but not quite — like "I am 25 years" instead of "I am 25 years old."',
    ],
    examples: [
      { context: 'everyday', text: 'I am from Brazil.' },
      { context: 'everyday', text: 'She is 28 years old.' },
      { context: 'professional', text: 'We are a small team of five people.' },
      { context: 'storytelling', text: 'He was tired, but he kept walking.' },
      { context: 'everyday', text: 'They are not ready yet.' },
    ],
    commonMistakes: [
      'Dropping "am/is/are" entirely: "I happy" instead of "I am happy."',
      'Forgetting "old" when stating an age: "I am 25 years" instead of "I am 25 years old."',
      'Forgetting the -s on regular verbs with he/she/it: "he work" instead of "he works."',
    ],
    quiz: [
      {
        type: 'fill',
        prompt: 'Complete: "She ___ a doctor."',
        acceptedAnswers: ['is'],
        explanation: '"She" is third-person singular, so the verb "to be" becomes "is."',
      },
      {
        type: 'mcq',
        prompt: 'Which is correct?',
        options: ['I am 30 years', 'I am 30 years old', 'I have 30 years', 'I are 30'],
        correctIndex: 1,
        explanation: 'English requires "years old" when stating age with "to be."',
      },
      {
        type: 'mcq',
        prompt: 'How do you make "You are ready" into a question?',
        options: ['Do you are ready?', 'Are you ready?', 'You are ready?', 'Is you ready?'],
        correctIndex: 1,
        explanation: 'With "to be", invert the subject and verb to make a question: "Are you ready?"',
      },
      {
        type: 'fill',
        prompt: 'Complete: "He ___ (work) every day."',
        acceptedAnswers: ['works'],
        explanation: 'Third-person singular subjects (he/she/it) add -s to the verb in the simple present.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is negative?',
        options: ['I am not tired.', "I amn't tired.", 'I not am tired.', "I don't tired."],
        correctIndex: 0,
        explanation: 'Add "not" directly after "am/is/are" to make it negative.',
      },
    ],
    linkPatternName: 'Simple Present for habits & facts',
  },

  'Everyday Survival Vocabulary': {
    icon: ShoppingBag,
    difficulty: 'easy',
    guidedQuestion: '"Excuse me" appears in several examples below, in different situations. Look at when it\'s used — what do all of those situations have in common?',
    concept: [
      "This module is your emergency toolkit — the words you need the moment you land in an English-speaking place: ordering food, asking for directions, and shopping.",
      'The magic phrase "Excuse me" politely opens almost any request — to get someone\'s attention, ask a question, or squeeze past someone. Pair it with "please" and "thank you," and you\'ll sound polite in almost any situation.',
      'For directions, you\'ll hear "turn left/right," "go straight," and "it\'s next to/across from/behind" — learning these prepositions of place is often more useful than memorizing street names.',
      'For shopping, "How much is this?" and "Do you have this in a different size/color?" cover most situations, and "I\'m just looking, thanks" is the polite way to browse without being helped.',
    ],
    examples: [
      { context: 'everyday', text: 'Excuse me, where is the nearest bus stop?' },
      { context: 'everyday', text: 'Could I have a coffee, please?' },
      { context: 'professional', text: 'Excuse me, could you point me to the meeting room?' },
      { context: 'storytelling', text: 'She asked a stranger for directions, and he walked her halfway there.' },
      { context: 'everyday', text: 'How much is this jacket?' },
    ],
    commonMistakes: [
      'Forgetting "please" when asking for something — leaving it out can sound like a demand rather than a request.',
      'Confusing "excuse me" (to get attention or pass by) with "sorry" (used after a mistake or bumping into someone).',
      'Dropping the verb "is": "How much this?" instead of "How much is this?"',
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: 'You want to get past someone on a crowded train. What do you say?',
        options: ['Sorry', 'Excuse me', 'Thank you', 'Please'],
        correctIndex: 1,
        explanation: '"Excuse me" is used to politely get past someone or get their attention.',
      },
      {
        type: 'fill',
        prompt: 'Complete: "How much ___ this jacket?"',
        acceptedAnswers: ['is'],
        explanation: 'The verb "is" is required: "How much is this jacket?"',
      },
      {
        type: 'mcq',
        prompt: "You just stepped on someone's foot by accident. What do you say?",
        options: ['Excuse me', 'Sorry', 'Please', 'How much'],
        correctIndex: 1,
        explanation: '"Sorry" is for mistakes or accidents; "excuse me" is for getting attention or passing by.',
      },
      {
        type: 'mcq',
        prompt: 'Which phrase politely declines help while browsing a shop?',
        options: ["I don't want it", "I'm just looking, thanks", 'No', 'Go away'],
        correctIndex: 1,
        explanation: '"I\'m just looking, thanks" is the standard polite way to browse without assistance.',
      },
    ],
    linkDecks: ['Everyday Vocabulary'],
  },
}
