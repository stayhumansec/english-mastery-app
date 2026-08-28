import { Clock, Hand, MessageCircle, ShoppingBag, SpellCheck, Shuffle, TrendingUp, type LucideIcon } from 'lucide-react'
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
   * the way a good teacher would explain it. Sub-use-cases each get their
   * own short paragraph rather than being blended together. */
  concept: string[]
  examples: LessonExample[]
  /** Each entry follows a consistent "❌ wrong → ✅ right — why" shape so
   * every mistake shows the incorrect form, the fix, and the reason. */
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
 * rest of the curriculum stays usable while more lessons are written.
 *
 * Content-depth pass (all A1 + A2 modules): every entry below carries
 * 10-15 examples across everyday/professional/storytelling contexts and
 * statement/question/negative forms, 5 common mistakes in a
 * "❌ wrong → ✅ right — why" shape, and 8-10 quiz questions mixing
 * multiple-choice, fill-in-the-blank, spot-the-error, and
 * which-sentence-is-correct styles (all still plain `mcq`/`fill` questions
 * under the hood — no schema or quiz-mechanics changes). B1-C2 modules are
 * intentionally left without an entry here for now (they fall back to the
 * existing "coming soon" shell) — see the note at the bottom of this file.
 */
export const LESSON_CONTENT: Record<string, LessonContent> = {
  'Basic Greetings': {
    icon: Hand,
    difficulty: 'easy',
    guidedQuestion: 'Look at the examples below before reading anything else. Notice how "Nice to meet you" and "Take care" are used — what do you think determines when each greeting or goodbye is appropriate?',
    concept: [
      'Imagine walking into a coffee shop for the first time. The barista smiles and says, "Hi, how are you?" You freeze — do you actually answer the question, or is it just being friendly? In English, small greetings like this are less about literally asking how you feel and more about warmth. Learning to greet people naturally is your first real step into English conversation.',
      'Time of day matters: "good morning" before noon, "good afternoon" until evening, "good evening" after that. "Hi" and "hello" work at any hour, with "hi" being the more casual of the two — useful when you\'re not sure which time-of-day greeting fits.',
      'First meeting vs. already knowing someone is the single biggest trap for learners. "Nice to meet you" announces a first introduction — say it once, not every time you see that person again. Once you know someone, switch to "Nice to see you" or simply "Hey, how\'s it going?"',
      'Formality shifts the whole greeting. A close friend gets "Hey!" or "What\'s up?"; a new manager or a client gets "Good morning, it\'s a pleasure to meet you." Matching your greeting\'s formality to the relationship is as important as the words themselves.',
      'Goodbyes have their own toolkit. "Bye," "see you later," "take care," and "catch you later" are casual; "goodbye" and "have a good day" are neutral-to-formal enough for almost any setting.',
      '"How are you?" is more ritual than real question — the expected reply is short and upbeat ("Good, thanks! And you?"), then the conversation moves on. Answering with your actual medical history is a classic non-native tell.',
      '"Good night" is not a greeting at all — it only means goodbye when leaving in the evening, or going to bed. Say "good evening" if you\'re arriving somewhere after dark.',
    ],
    examples: [
      { context: 'everyday', text: 'Hi! How are you doing today?' },
      { context: 'everyday', text: 'Good morning! Did you sleep well?' },
      { context: 'professional', text: 'Good afternoon, thank you for joining the call.' },
      { context: 'storytelling', text: "She smiled and said, \"Nice to meet you — I've heard so much about you.\"" },
      { context: 'everyday', text: 'Take care! See you next week.' },
      { context: 'everyday', text: "We haven't met before — nice to meet you!" },
      { context: 'everyday', text: "Nice to see you again — it's been a while!" },
      { context: 'professional', text: 'Good evening, everyone, and welcome to tonight\'s presentation.' },
      { context: 'everyday', text: "Aren't you Maria's brother? We met at the party last month." },
      { context: 'storytelling', text: "He didn't say hello — he just walked straight past her without a word." },
      { context: 'professional', text: 'It was a pleasure meeting you; I look forward to working together.' },
      { context: 'everyday', text: "Catch you later! Don't be a stranger." },
      { context: 'professional', text: "Good morning — I don't think we've officially met. I'm Priya, from the design team." },
    ],
    commonMistakes: [
      '❌ Saying "Nice to meet you" to a close friend of five years → ✅ "Nice to see you" — "nice to meet you" only fits a first introduction.',
      '❌ Answering "How are you?" with your full week\'s events → ✅ "Good, thanks — and you?" — it\'s a social ritual, not a real request for details.',
      '❌ "Good night, welcome to the party!" when arriving in the evening → ✅ "Good evening, welcome!" — "good night" is only a farewell or bedtime phrase, never a welcome.',
      '❌ "Hello boss, what\'s up?" in a formal meeting → ✅ "Good morning, how are you?" — match your greeting\'s formality to the setting.',
      '❌ Jumping straight into a request with no greeting at all ("Give me the file.") → ✅ "Hi, could I get that file, please?" — a quick greeting softens even short interactions.',
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
      {
        type: 'mcq',
        prompt: "What's wrong with this sentence: \"Good night! Welcome to the party.\"",
        options: [
          'Nothing is wrong',
          '"Good night" is a farewell, not a welcome — it should be "Good evening"',
          "It's too informal for a party",
          'It should be "Goodbye! Welcome to the party."',
        ],
        correctIndex: 1,
        explanation: 'Use "good evening" to greet someone after dark — "good night" only means goodbye or bedtime.',
      },
      {
        type: 'mcq',
        prompt: 'Which greeting best fits meeting your new manager for the first time?',
        options: ['Yo, what\'s good', 'Hi', 'Good morning, it\'s a pleasure to meet you', 'Sup'],
        correctIndex: 2,
        explanation: 'A first meeting with someone senior calls for a fuller, more formal greeting than a casual "hi."',
      },
      {
        type: 'fill',
        prompt: 'Complete the casual goodbye: "See you ____!"',
        acceptedAnswers: ['later'],
        explanation: '"See you later" is a common, casual way to say goodbye when you expect to meet again.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed for greeting a colleague at 9 a.m.?',
        options: ['Good night, ready to start?', 'Good morning, ready to start?', 'Good evening, ready to start?', 'Goodbye, ready to start?'],
        correctIndex: 1,
        explanation: '"Good morning" is the correct time-of-day greeting before noon.',
      },
      {
        type: 'mcq',
        prompt: 'Your neighbor greets you every morning with "Nice to meet you!" even though you\'ve lived next to each other for two years. What should they say instead?',
        options: ['Nice to see you', 'Nice to meet you (it\'s correct)', 'Goodbye', 'Good night'],
        correctIndex: 0,
        explanation: '"Nice to meet you" is reserved for the very first meeting — after that, "nice to see you" is correct.',
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
      'Cardinal numbers (one, two, three...) are for counting, prices, and clock times. Ordinal numbers (first, second, third...) are for dates and rankings. Mixing them up is one of the most common slips learners make: "March two" instead of "March second."',
      'Telling time has two common styles: digital-style ("three thirty" for 3:30) and traditional ("half past three"). "Quarter past" and "quarter to" cover :15 and :45 — "quarter to four" means 3:45, fifteen minutes before four.',
      'Dates trip learners up because the US and most of the world write them differently: Americans say month/day/year (03/21/2026), while the UK and most other countries say day/month/year (21/03/2026). When in doubt, say the date in words — "March twenty-first" — to avoid the ambiguity entirely.',
      'The three little prepositions of time each have their own job: "at" for exact clock times and named points (at 3:00, at noon, at midnight), "on" for days and dates (on Monday, on March 3rd), and "in" for longer stretches like months, years, and seasons (in March, in 2026, in the morning).',
      'Reading numbers aloud has its own conventions: phone numbers are read digit by digit ("oh-two-one, five-five-five"), prices are read as whole amounts ("nineteen ninety-nine" for $19.99), and years before 2000 are usually split in two ("nineteen ninety-eight" for 1998).',
    ],
    examples: [
      { context: 'everyday', text: 'My phone number is oh-two-one, five-five-five, one-two-three-four.' },
      { context: 'everyday', text: "Let's meet at half past two." },
      { context: 'professional', text: 'The meeting is scheduled for the twenty-third of March.' },
      { context: 'storytelling', text: 'It was quarter to midnight when the train finally arrived.' },
      { context: 'everyday', text: 'That will be nineteen ninety-nine, please.' },
      { context: 'everyday', text: "What time is it? — It's quarter past nine." },
      { context: 'professional', text: 'Could we push the call to four o\'clock instead of three?' },
      { context: 'everyday', text: "The store doesn't open until ten on Sundays." },
      { context: 'storytelling', text: 'She was born on the fourteenth of July, nineteen ninety.' },
      { context: 'professional', text: 'Our fiscal year starts in April, not in January.' },
      { context: 'everyday', text: "It isn't three yet — you're early." },
      { context: 'everyday', text: 'I was born in nineteen ninety-eight, on the second of June.' },
      { context: 'professional', text: 'The invoice is due on the first of the month, not the last.' },
    ],
    commonMistakes: [
      '❌ Writing a date in digits without knowing which format the reader expects (03/04 could mean March 4 or April 3) → ✅ Say or write it in words: "March fourth" — always unambiguous.',
      '❌ "The meeting is at Monday" → ✅ "The meeting is on Monday" — days and dates take "on," not "at."',
      '❌ "I was born at 1998" → ✅ "I was born in 1998" — years and months take "in," not "at."',
      '❌ "March two" for March 2nd → ✅ "March second" — dates use ordinal numbers, not cardinal.',
      "❌ \"It's three and a half\" for 3:30 → ✅ \"It's half past three\" or \"three thirty\" — \"three and a half\" describes a quantity, not a clock time.",
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
      {
        type: 'mcq',
        prompt: "What's wrong with: \"The meeting is at Monday at 3pm\"?",
        options: [
          'Nothing is wrong',
          '"at Monday" should be "on Monday" — days take "on," not "at"',
          '"3pm" should be "3:00pm"',
          '"meeting" should be "meet"',
        ],
        correctIndex: 1,
        explanation: 'Days and dates take "on"; only exact clock times and named points like noon/midnight take "at."',
      },
      {
        type: 'fill',
        prompt: 'Complete: "Quarter ____ four" means 3:45.',
        acceptedAnswers: ['to'],
        explanation: '"Quarter to four" means fifteen minutes before four, i.e. 3:45.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed?',
        options: ["I was born in 1998.", "I was born at 1998.", "I was born on 1998.", "I was born by 1998."],
        correctIndex: 0,
        explanation: 'Years take "in": "I was born in 1998."',
      },
      {
        type: 'mcq',
        prompt: 'How do you read the price $19.99 aloud in everyday speech?',
        options: ['One nine, nine nine dollars', 'Nineteen ninety-nine', 'One thousand nine hundred ninety-nine', 'Nineteen point nine nine'],
        correctIndex: 1,
        explanation: 'Prices are usually read as a whole number: "nineteen ninety-nine."',
      },
      {
        type: 'mcq',
        prompt: 'Someone reads their phone number as "zero-two-one, five hundred fifty-five..." What would sound more natural?',
        options: [
          'Reading it exactly the same way — it\'s already natural',
          '"Oh-two-one, five-five-five..." — phone numbers are usually read digit by digit',
          'Reading the whole number as one big number',
          'Spelling out each digit in full ("zero two one")',
        ],
        correctIndex: 1,
        explanation: 'Phone numbers are conventionally read one digit at a time, with "oh" often replacing "zero."',
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
      'The simple present, for other verbs, describes habits, facts, and routines — things generally true, not just happening right now: "I work in a hospital," "The sun rises in the east." Remember the -s/-es ending for he/she/it: "she works," "he watches," "it costs."',
      'Questions and negatives with regular verbs need a helper verb, "do/does," that "to be" never needs: "Does she work here?" and "She doesn\'t work here" — not "Works she here?" or "She works not here."',
      'A lot of learners translate "to be" literally from their first language, which creates sentences that sound almost right but not quite — like "I am 25 years" instead of "I am 25 years old," or "I have hunger" instead of "I am hungry."',
      '"To be" also describes location and existence, not just identity: "The keys are on the table," "There is a problem." Notice "there is/are" is a special use — it introduces something existing, not a subject called "there."',
    ],
    examples: [
      { context: 'everyday', text: 'I am from Brazil.' },
      { context: 'everyday', text: 'She is 28 years old.' },
      { context: 'professional', text: 'We are a small team of five people.' },
      { context: 'storytelling', text: 'He was tired, but he kept walking.' },
      { context: 'everyday', text: 'They are not ready yet.' },
      { context: 'everyday', text: 'Are you free this weekend?' },
      { context: 'professional', text: 'She works in marketing, not in sales.' },
      { context: 'everyday', text: "He doesn't like coffee, but he loves tea." },
      { context: 'storytelling', text: 'The old house is quiet at night; the stairs are always cold.' },
      { context: 'everyday', text: "There isn't any milk left in the fridge." },
      { context: 'professional', text: 'Does the report cover last quarter as well?' },
      { context: 'everyday', text: "I'm not hungry, but I am thirsty." },
      { context: 'everyday', text: "The train leaves at seven, so we aren't in a rush yet." },
    ],
    commonMistakes: [
      '❌ "I happy" → ✅ "I am happy" — "to be" can never be dropped in an English sentence.',
      '❌ "I am 25 years" → ✅ "I am 25 years old" — age always needs "years old," not just "years."',
      '❌ "He work in a bank" → ✅ "He works in a bank" — third-person singular subjects (he/she/it) add -s in the simple present.',
      '❌ "She not is here" → ✅ "She is not here" — "not" goes directly after the verb "to be," never before it.',
      '❌ "Does she works here?" → ✅ "Does she work here?" — once "does" appears, the main verb drops its -s.',
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
      {
        type: 'mcq',
        prompt: "What's wrong with: \"Does she works here?\"",
        options: [
          'Nothing is wrong',
          'Once "does" is used, the main verb should be plain: "Does she work here?"',
          'It should be "Do she works here?"',
          '"here" should be "there"',
        ],
        correctIndex: 1,
        explanation: '"Does" already carries the third-person -s, so the main verb stays in its base form: "work," not "works."',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed?',
        options: ["She not is ready.", "She isn't ready.", "She no is ready.", "She is not be ready."],
        correctIndex: 1,
        explanation: '"Isn\'t" (is + not) is the correct contracted negative of "to be."',
      },
      {
        type: 'fill',
        prompt: 'Complete: "There ___ a problem with the printer."',
        acceptedAnswers: ['is'],
        explanation: '"There is" introduces one thing that exists; "there are" would be used for plural things.',
      },
      {
        type: 'mcq',
        prompt: 'Which best expresses "I have hunger" in natural English?',
        options: ["I have hunger.", "I am hunger.", "I am hungry.", "I hungry."],
        correctIndex: 2,
        explanation: 'English uses "to be" + adjective for physical states like hunger, thirst, and tiredness: "I am hungry."',
      },
    ],
    linkPatternName: 'Simple Present for habits & facts',
  },

  'Everyday Survival Vocabulary': {
    icon: ShoppingBag,
    difficulty: 'easy',
    guidedQuestion: '"Excuse me" appears in several examples below, in different situations. Look at when it\'s used — what do all of those situations have in common?',
    concept: [
      "This module is your emergency toolkit — the words you need the moment you land in an English-speaking place: getting attention, asking for directions, ordering food, and shopping.",
      'The magic phrase "Excuse me" politely opens almost any request — to get someone\'s attention, ask a question, or squeeze past someone. It\'s different from "sorry," which is for mistakes or accidents ("Sorry, I stepped on your foot").',
      'For directions, you\'ll hear "turn left/right," "go straight," and "it\'s next to/across from/behind" — learning these prepositions of place is often more useful than memorizing street names. Questions usually start with "Where is..." or "How do I get to...?"',
      'For shopping, "How much is this?" and "Do you have this in a different size/color?" cover most situations, and "I\'m just looking, thanks" is the polite way to browse without being helped.',
      'For ordering food, "Could I have..." or "I\'ll have..." are the standard polite openers, and "Is this spicy?" or "Does this contain nuts?" cover common dietary questions. "Could I have the bill, please?" (or "check" in American English) closes the meal.',
      'Politeness words do real work in English: "please" turns a demand into a request, and "thank you" (or "thanks") closes almost any interaction warmly, however small.',
    ],
    examples: [
      { context: 'everyday', text: 'Excuse me, where is the nearest bus stop?' },
      { context: 'everyday', text: 'Could I have a coffee, please?' },
      { context: 'professional', text: 'Excuse me, could you point me to the meeting room?' },
      { context: 'storytelling', text: 'She asked a stranger for directions, and he walked her halfway there.' },
      { context: 'everyday', text: 'How much is this jacket?' },
      { context: 'everyday', text: "Do you have this in a smaller size?" },
      { context: 'everyday', text: "Is this dish spicy? I can't eat anything too hot." },
      { context: 'everyday', text: "I'm just looking, thanks." },
      { context: 'professional', text: "Sorry, could you say that again? I didn't quite catch it." },
      { context: 'everyday', text: "Excuse me, is this seat taken?" },
      { context: 'everyday', text: "Could we have the bill, please?" },
      { context: 'everyday', text: "It isn't far — just go straight and turn left at the corner." },
      { context: 'storytelling', text: "He wasn't sure where to turn, so he stopped to ask a shopkeeper." },
    ],
    commonMistakes: [
      '❌ "Give me a coffee" → ✅ "Could I have a coffee, please?" — leaving out "please"/"could I" can sound like a demand rather than a request.',
      '❌ Saying "Sorry" to get someone\'s attention in a shop → ✅ "Excuse me" — "sorry" is for mistakes or accidents, "excuse me" is for getting attention or passing by.',
      '❌ "How much this?" → ✅ "How much is this?" — the verb "is" can\'t be dropped.',
      '❌ "Where the bus stop?" → ✅ "Where is the bus stop?" — questions need the verb "is/are" in place, not just the question word.',
      '❌ "I want the bill" → ✅ "Could we have the bill, please?" — a softer request reads as polite rather than blunt in English-speaking service settings.',
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
      {
        type: 'mcq',
        prompt: "What's wrong with: \"Where the bus stop?\"",
        options: [
          'Nothing is wrong',
          'It\'s missing the verb: "Where is the bus stop?"',
          'It should be "Where bus stop is?"',
          '"bus stop" should be "bus-stop"',
        ],
        correctIndex: 1,
        explanation: 'Questions with "where/how/what" still need the verb "is/are" in its normal question position.',
      },
      {
        type: 'fill',
        prompt: 'Complete the polite request: "___ I have a coffee, please?"',
        acceptedAnswers: ['Could'],
        explanation: '"Could I have..." is a standard polite way to order or request something.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed?',
        options: ['How much this jacket?', 'How much is this jacket?', 'How much is jacket this?', 'This jacket how much?'],
        correctIndex: 1,
        explanation: '"How much is this jacket?" keeps the verb "is" in its correct place after the question word.',
      },
      {
        type: 'mcq',
        prompt: 'At a restaurant, which question checks for a dietary restriction?',
        options: ['How much is this?', 'Does this contain nuts?', 'Is this seat taken?', 'Where is the bus stop?'],
        correctIndex: 1,
        explanation: '"Does this contain nuts?" is the standard way to ask about ingredients for allergies or diet.',
      },
      {
        type: 'mcq',
        prompt: 'You want the check at the end of a meal. What do you say (British English)?',
        options: ['Could we have the bill, please?', 'Give me money', 'How much this?', 'I want to pay now go'],
        correctIndex: 0,
        explanation: '"Could we have the bill, please?" is the standard polite closing request (Americans usually say "check").',
      },
    ],
    linkDecks: ['Everyday Vocabulary'],
  },

  'Past Simple & Past Continuous': {
    icon: Clock,
    difficulty: 'medium',
    guidedQuestion: 'Look at the examples below. Some describe a single finished action ("She called me"), while others describe something in progress ("I was cooking..."). What differences do you notice in how each is formed, and when each is used together in the same sentence?',
    concept: [
      'The past simple describes a completed action at a specific past time: "I visited Rome last year." Regular verbs add -ed ("walked," "visited"); many common verbs are irregular ("went," "saw," "ate") and simply have to be learned.',
      'The past continuous (was/were + -ing) describes an action in progress at a moment in the past, without saying whether it finished: "I was cooking dinner at 7pm." It sets the scene rather than reporting the headline event.',
      'Their real power shows up together: the past continuous sets the background, and the past simple interrupts it. "I was watching TV when the phone rang" — the phone ringing (past simple) interrupts the watching (past continuous), which was already in progress.',
      'Time markers hint at which one to use: "yesterday," "last week," "in 2019," and "for two hours" usually pair with the past simple (a complete, bounded event). "While," "as," and "at that moment" usually pair with the past continuous (mid-action).',
      'Two past continuous actions can also happen at the same time, side by side: "While she was cooking, he was setting the table" — both actions were in progress together, and the sentence doesn\'t claim either one finished.',
      'Negatives and questions: past simple uses "did(n\'t)" + base verb ("I didn\'t go," "Did you go?"); past continuous uses "wasn\'t/weren\'t" + -ing ("I wasn\'t sleeping," "Were you sleeping?"). A common slip is double-marking the past: "I didn\'t went" instead of "I didn\'t go."',
    ],
    examples: [
      { context: 'everyday', text: 'We watched a movie last night.' },
      { context: 'professional', text: 'The client signed the contract yesterday.' },
      { context: 'storytelling', text: 'She left the village when she was sixteen.' },
      { context: 'everyday', text: 'I was cooking dinner when you called.' },
      { context: 'storytelling', text: 'While she was reading, the lights suddenly went out.' },
      { context: 'everyday', text: "I didn't go to the party — I wasn't feeling well." },
      { context: 'professional', text: 'Were you working here in 2019?' },
      { context: 'everyday', text: "Did you see the email I sent this morning?" },
      { context: 'storytelling', text: 'While he was driving home, it started to rain heavily.' },
      { context: 'everyday', text: "I lived in Lisbon for three years (finished — I don't live there now), but I was living there when I met my husband (background to another event)." },
      { context: 'professional', text: 'She was presenting the results when the fire alarm went off.' },
      { context: 'everyday', text: "We weren't expecting so many guests." },
      { context: 'storytelling', text: 'As the sun was setting, the fishermen returned to the harbor.' },
    ],
    commonMistakes: [
      '❌ "I didn\'t went to school" → ✅ "I didn\'t go to school" — after "did/didn\'t," the main verb returns to its base form.',
      '❌ "I was know the answer" → ✅ "I knew the answer" — state verbs like know, want, and believe don\'t normally take the continuous form.',
      '❌ "While I watched TV, the phone rang" (using past simple for the background action) → ✅ "While I was watching TV, the phone rang" — the ongoing background action needs the continuous form.',
      '❌ "When I was arriving, she left already" → ✅ "When I arrived, she had already left" — two completed sequential events both take the past simple (or past perfect for the earlier one), not the continuous.',
      '❌ "Yesterday I am going to the store" → ✅ "Yesterday I went to the store" — a clear past time marker like "yesterday" requires a past-tense verb, not the present.',
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: 'Which sentence correctly combines an interrupted action?',
        options: [
          'I watched TV when the phone was ringing.',
          'I was watching TV when the phone rang.',
          'I am watching TV when the phone rang.',
          'I was watch TV when the phone rang.',
        ],
        correctIndex: 1,
        explanation: 'The ongoing background action ("was watching") is interrupted by the single completed action ("rang").',
      },
      {
        type: 'fill',
        prompt: 'Complete: "She ___ (visit) her grandmother last weekend."',
        acceptedAnswers: ['visited'],
        explanation: '"Last weekend" signals a completed past action, so the past simple "visited" is correct.',
      },
      {
        type: 'mcq',
        prompt: "What's wrong with: \"I didn't went to the meeting\"?",
        options: [
          'Nothing is wrong',
          'After "didn\'t," the verb should be base form: "I didn\'t go to the meeting"',
          'It should be "I not went to the meeting"',
          '"meeting" should be "meetings"',
        ],
        correctIndex: 1,
        explanation: '"Didn\'t" already carries the past tense, so the main verb stays in its base form: "go," not "went."',
      },
      {
        type: 'mcq',
        prompt: 'Which time marker most naturally pairs with the past continuous?',
        options: ['yesterday', 'last week', 'while', 'in 2019'],
        correctIndex: 2,
        explanation: '"While" typically introduces a background action in progress, which takes the past continuous.',
      },
      {
        type: 'fill',
        prompt: 'Complete: "___ you working here in 2019?"',
        acceptedAnswers: ['Were'],
        explanation: 'Past continuous questions with "you" use "were": "Were you working here...?"',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed?',
        options: [
          'While she was cooking, he was setting the table.',
          'While she cooked, he was setting the table.',
          'While she was cooking, he set the table.',
          'Both A and C are natural, depending on what you want to say.',
        ],
        correctIndex: 3,
        explanation: 'A describes two simultaneous ongoing actions; C describes one background action (cooking) interrupted or accompanied by a completed one (set the table) — both are correct depending on the intended meaning.',
      },
      {
        type: 'mcq',
        prompt: "What's the mistake in: \"I was know the answer before you asked\"?",
        options: [
          'Nothing is wrong',
          '"know" is a state verb and doesn\'t normally take the continuous form — it should be "I knew the answer"',
          'It should be "I am know the answer"',
          '"asked" should be "was asking"',
        ],
        correctIndex: 1,
        explanation: 'State verbs (know, want, believe, love) describe states, not actions in progress, so they stay in the simple form.',
      },
      {
        type: 'mcq',
        prompt: 'Which best distinguishes a finished past state from an ongoing background one?',
        options: [
          '"I lived in Lisbon for three years" vs. "I was living there when I met my husband"',
          '"I live in Lisbon" vs. "I lived in Lisbon"',
          '"I was living in Lisbon" vs. "I am living in Lisbon"',
          'There is no difference between these forms',
        ],
        correctIndex: 0,
        explanation: 'The past simple frames a complete, bounded period; the past continuous frames the background against which something else happened.',
      },
      {
        type: 'fill',
        prompt: 'Complete: "While he ___ (drive) home, it started to rain."',
        acceptedAnswers: ['was driving'],
        explanation: '"Was driving" is the ongoing background action that the sudden rain (past simple) interrupts.',
      },
    ],
    linkPatternName: 'Past Simple for finished actions',
  },

  'Comparatives & Superlatives': {
    icon: TrendingUp,
    difficulty: 'medium',
    guidedQuestion: 'Look at the adjective endings in the examples below — "stronger," "more efficient," "the best." What determines whether an adjective adds "-er/-est" or uses "more/most" instead?',
    concept: [
      'Comparatives compare two things ("This coffee is stronger than that one"); superlatives single out the extreme in a group of three or more ("This is the strongest coffee I\'ve ever had").',
      'Short adjectives (usually one syllable, sometimes two) add -er/-est: "strong → stronger → strongest," "big → bigger → biggest" (note the doubled consonant). Longer adjectives (two+ syllables, especially ones ending in -ful, -ous, -ive) use "more/most" instead: "efficient → more efficient → most efficient."',
      'A handful of very common adjectives are irregular and simply don\'t follow either rule: "good → better → best," "bad → worse → worst," "far → farther/further → farthest/furthest." These have to be memorized individually.',
      'When two things are equal, use "as...as" instead of a comparative: "This phone is as fast as that one" (equal), versus "This phone is faster than that one" (unequal). The negative form, "not as...as," softens a comparison: "It\'s not as expensive as I expected."',
      'The most common error is doubling the comparison — combining "more" with "-er," or "most" with "-est": "more better" or "most strongest" are both wrong; pick one method per adjective, never both.',
      'Comparatives need "than" to introduce the second thing being compared ("faster than a train"); superlatives need "the" before them ("the fastest train") since they point to one specific, unique extreme.',
    ],
    examples: [
      { context: 'everyday', text: 'This coffee is stronger than that one.' },
      { context: 'professional', text: 'This proposal is more efficient than the previous plan.' },
      { context: 'storytelling', text: 'The second half of the journey was harder than the first.' },
      { context: 'everyday', text: 'She is the tallest person in our family.' },
      { context: 'professional', text: 'This is the most cost-effective option we have.' },
      { context: 'everyday', text: "This bag isn't as heavy as it looks." },
      { context: 'everyday', text: 'Is your phone faster than mine?' },
      { context: 'storytelling', text: 'Of all the paths, this one was the least dangerous.' },
      { context: 'professional', text: "Our new server handles traffic better than the old one did." },
      { context: 'everyday', text: 'This is the worst coffee I have ever tasted.' },
      { context: 'everyday', text: 'The weather today is as bad as yesterday.' },
      { context: 'storytelling', text: "It wasn't the biggest house on the street, but it was the warmest." },
      { context: 'professional', text: 'Of the three vendors, this one offers the most reliable service.' },
    ],
    commonMistakes: [
      '❌ "more stronger" → ✅ "stronger" — never combine "more" with an "-er" ending; pick one method.',
      '❌ "most strongest" → ✅ "the strongest" — the same rule applies to superlatives: never combine "most" with "-est."',
      '❌ "gooder" → ✅ "better" — "good" is irregular; it never takes "-er."',
      '❌ "This is more big than that" → ✅ "This is bigger than that" — short adjectives take "-er," not "more."',
      '❌ "She is the taller in the family" (three or more people) → ✅ "She is the tallest in the family" — comparing more than two things always needs the superlative, not the comparative.',
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: 'Which is correct?',
        options: ['more stronger', 'stronger', 'most strong', 'strongest than'],
        correctIndex: 1,
        explanation: 'Short adjectives take -er; never combine "more" with "-er."',
      },
      {
        type: 'fill',
        prompt: 'Complete: "This proposal is ___ (efficient) than the last one." (comparative)',
        acceptedAnswers: ['more efficient'],
        explanation: 'Longer adjectives like "efficient" use "more" instead of an -er ending.',
      },
      {
        type: 'mcq',
        prompt: 'What is the superlative form of "bad"?',
        options: ['baddest', 'more bad', 'worst', 'most bad'],
        correctIndex: 2,
        explanation: '"Bad" is irregular: bad → worse → worst.',
      },
      {
        type: 'mcq',
        prompt: "What's wrong with: \"This is the most strongest coffee I've had\"?",
        options: [
          'Nothing is wrong',
          '"most" and "-est" are doubled up — it should be "the strongest"',
          'It should be "more strongest"',
          '"coffee" should be "coffees"',
        ],
        correctIndex: 1,
        explanation: 'Never combine "most" with an "-est" ending — choose one method of forming the superlative.',
      },
      {
        type: 'fill',
        prompt: 'Complete the equal comparison: "This bag is ___ heavy ___ that one." (equal weight)',
        acceptedAnswers: ['as heavy as', 'as...as'],
        explanation: '"As...as" expresses that two things are equal in some quality.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed?',
        options: ['She is more tall than her brother.', 'She is taller than her brother.', 'She is tallest than her brother.', 'She is the tall than her brother.'],
        correctIndex: 1,
        explanation: '"Tall" is a short adjective, so it takes "-er": "taller than."',
      },
      {
        type: 'mcq',
        prompt: 'Comparing three or more vendors, which is correct?',
        options: [
          'This vendor is more reliable of the three.',
          'This vendor is the more reliable of the three.',
          'This vendor is the most reliable of the three.',
          'This vendor is reliabler than the three.',
        ],
        correctIndex: 2,
        explanation: 'When comparing three or more things, use the superlative ("the most reliable"), not the comparative.',
      },
      {
        type: 'mcq',
        prompt: "What's the mistake in: \"My phone is gooder than yours\"?",
        options: [
          'Nothing is wrong',
          '"good" is irregular — it should be "My phone is better than yours"',
          'It should be "more good"',
          '"than" should be "as"',
        ],
        correctIndex: 1,
        explanation: '"Good" doesn\'t take "-er" — its irregular comparative is "better."',
      },
      {
        type: 'fill',
        prompt: 'Complete: "Of all the paths, this one was the ___ (dangerous) — least likely to cause injury." (superlative meaning "not dangerous")',
        acceptedAnswers: ['least dangerous'],
        explanation: '"Least" forms the opposite-direction superlative for adjectives that take "more/most": "least dangerous."',
      },
    ],
    linkPatternName: 'Comparative adjectives',
  },

  'Making Plans (Future Forms)': {
    icon: Shuffle,
    difficulty: 'medium',
    guidedQuestion: 'Compare "I\'m going to call her," "I\'m meeting her at 5," and "I\'ll call her." All three talk about the future — but look closely: which one sounds like a decision made in advance, which sounds like a fixed diary entry, and which sounds like a decision made right now?',
    concept: [
      'English has no single future tense — instead it borrows several forms, and the choice between them signals how certain, planned, or spontaneous the future action is.',
      '"Going to" + base verb expresses a plan or intention already decided before the moment of speaking: "I\'m going to start a new job next month." It\'s also used for predictions based on present evidence: "Look at those clouds — it\'s going to rain."',
      'The present continuous (be + -ing) expresses a fixed arrangement, usually with a specific time and often involving another person: "I\'m meeting Sara at 6 tonight" — it\'s already on the calendar, not just an intention.',
      '"Will" + base verb covers three related uses: a decision made at the moment of speaking ("The phone\'s ringing — I\'ll get it"), a prediction without present evidence ("I think she\'ll say yes"), and a promise or offer ("I\'ll help you carry that").',
      'The key contrast: "I\'m going to call her" (already decided beforehand) vs. "I\'ll call her" (deciding right now, on the spot) — both are grammatically fine, but they signal different timing of the decision.',
      'Time expressions often hint at the right form: "tonight," "at 5pm," "on Friday" pair naturally with the present continuous for arrangements; "next year," "someday," "eventually" pair more naturally with "going to" or "will" for looser plans and predictions.',
    ],
    examples: [
      { context: 'everyday', text: "I'm going to start a new job next month." },
      { context: 'everyday', text: 'Look at those clouds — it\'s going to rain.' },
      { context: 'professional', text: "I'm meeting the client at 6 tonight." },
      { context: 'everyday', text: "The phone's ringing — I'll get it." },
      { context: 'storytelling', text: 'She promised she would write, and she will.' },
      { context: 'professional', text: 'We are launching the new product on Friday.' },
      { context: 'everyday', text: "I think it'll be sunny tomorrow." },
      { context: 'everyday', text: "I'm not going to finish this today — there's too much left." },
      { context: 'professional', text: 'Will you be attending the conference next week?' },
      { context: 'everyday', text: "Are you doing anything this weekend?" },
      { context: 'storytelling', text: "He wasn't going to go, but at the last minute he changed his mind." },
      { context: 'everyday', text: "I'll help you carry that — it looks heavy." },
      { context: 'professional', text: "We won't have the results ready until Thursday." },
    ],
    commonMistakes: [
      '❌ "I will go to the dentist tomorrow at 3pm" for a pre-booked appointment → ✅ "I\'m going to the dentist tomorrow at 3pm" or "I\'m seeing the dentist at 3pm" — a fixed, already-arranged appointment usually takes "going to" or the present continuous, not "will."',
      '❌ "I go to Paris next summer" (using the plain present for a future plan) → ✅ "I\'m going to Paris next summer" — the plain present without "going to"/"-ing" doesn\'t naturally express a personal future plan.',
      '❌ Deciding on the spot but saying "I\'m going to help you" as if pre-planned → ✅ "I\'ll help you" — a decision made right at the moment of speaking uses "will," not "going to."',
      '❌ "It will rain, look at the clouds!" (prediction from visible present evidence) → ✅ "It\'s going to rain, look at the clouds!" — predictions based on something you can see or sense right now prefer "going to," not "will."',
      '❌ "I will meeting her tomorrow" → ✅ "I am meeting her tomorrow" — the present continuous future needs "am/is/are," not "will," before the -ing form.',
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: 'Which sentence best expresses a decision made at the moment of speaking?',
        options: [
          "I'm going to answer the phone.",
          "I'll answer the phone.",
          "I'm answering the phone tomorrow.",
          "I answer the phone.",
        ],
        correctIndex: 1,
        explanation: '"Will" is the natural choice for an on-the-spot decision, like answering a ringing phone right now.',
      },
      {
        type: 'fill',
        prompt: 'Complete (fixed arrangement): "I ___ (meet) the client at 6 tonight."',
        acceptedAnswers: ['am meeting', "'m meeting"],
        explanation: 'A specific, pre-arranged time like "at 6 tonight" typically takes the present continuous.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is a prediction based on visible present evidence?',
        options: [
          "I think she'll say yes.",
          "Look at those clouds — it's going to rain.",
          "I'll help you with that.",
          "We are launching on Friday.",
        ],
        correctIndex: 1,
        explanation: '"Going to" is preferred for predictions grounded in something visible right now, like dark clouds.',
      },
      {
        type: 'mcq',
        prompt: "What's wrong with: \"I will go to the dentist tomorrow at 3pm\" for an appointment booked last week?",
        options: [
          'Nothing is wrong',
          'A pre-arranged appointment usually takes "going to" or the present continuous, not "will"',
          'It should be "I go to the dentist"',
          '"tomorrow" should be "yesterday"',
        ],
        correctIndex: 1,
        explanation: 'Since the appointment was already arranged, "I\'m going to the dentist" or "I\'m seeing the dentist" fits better than "will."',
      },
      {
        type: 'fill',
        prompt: 'Complete (promise): "___ help you carry that bag."',
        acceptedAnswers: ["I'll", 'I will'],
        explanation: '"I\'ll" (will) is the natural form for an offer or promise made on the spot.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed?',
        options: [
          "I will meeting her tomorrow.",
          "I am meeting her tomorrow.",
          "I meeting her tomorrow.",
          "I go meeting her tomorrow.",
        ],
        correctIndex: 1,
        explanation: 'The present continuous future needs "am/is/are" before the -ing form, not "will."',
      },
      {
        type: 'mcq',
        prompt: 'Which pair correctly contrasts a pre-decided plan vs. a spontaneous decision?',
        options: [
          '"I\'m going to call her" (decided earlier) vs. "I\'ll call her" (deciding now)',
          '"I\'ll call her" (decided earlier) vs. "I\'m going to call her" (deciding now)',
          'Both mean exactly the same thing in every context',
          'Neither can express a spontaneous decision',
        ],
        correctIndex: 0,
        explanation: '"Going to" reflects a decision already made; "will" reflects one made in the moment.',
      },
      {
        type: 'mcq',
        prompt: "What's the mistake in: \"I go to Paris next summer\" (as a personal travel plan)?",
        options: [
          'Nothing is wrong',
          'The plain present doesn\'t express a personal future plan — it should be "I\'m going to Paris next summer"',
          'It should be "I went to Paris next summer"',
          '"Paris" should be "the Paris"',
        ],
        correctIndex: 1,
        explanation: 'A personal future plan needs "going to" or the present continuous, not the plain present tense.',
      },
      {
        type: 'fill',
        prompt: 'Complete: "___ you be attending the conference next week?" (polite future question)',
        acceptedAnswers: ['Will'],
        explanation: '"Will you be...?" is a natural, slightly formal way to ask about someone\'s future plans.',
      },
    ],
    linkDecks: ['Sentence Patterns'],
  },

  'Everyday Conversations': {
    icon: MessageCircle,
    difficulty: 'medium',
    guidedQuestion: 'Look at how each conversation below opens, responds, and closes. What phrases show up again and again to keep the conversation moving, agree, disagree, or politely end it?',
    concept: [
      'Small talk runs on a small set of reusable openers: comments about the weather, a compliment, or a question about someone\'s weekend ("Busy day?", "Nice weather today, isn\'t it?"). The content matters less than showing friendly engagement.',
      'Agreeing is easy ("I think so too," "Exactly," "That\'s so true"), but disagreeing politely takes more care in English — direct disagreement can sound rude, so softeners are common: "I see what you mean, but...", "That\'s a fair point, though I\'d say..."',
      'Asking for someone\'s opinion politely uses phrases like "What do you think about...?" or "How do you feel about...?" rather than a blunt "Tell me your opinion."',
      'Phone conversations have their own script: opening ("Hi, it\'s [name] calling"), checking if it\'s a good time ("Is now a good time to talk?"), and closing ("Thanks for calling, talk soon!").',
      'Ending a conversation politely needs a signal before the actual goodbye — "Anyway, I should get going" or "Well, it was great catching up" — abruptly stopping mid-conversation can feel jarring.',
      'Filler phrases like "you know," "I mean," and "actually" aren\'t mistakes — native speakers use them constantly to soften statements, buy thinking time, or add emphasis.',
    ],
    examples: [
      { context: 'everyday', text: 'Nice weather today, isn\'t it?' },
      { context: 'everyday', text: 'Busy day? You look tired.' },
      { context: 'everyday', text: 'I think so too — it was a great presentation.' },
      { context: 'professional', text: 'I see what you mean, but I think we should also consider the cost.' },
      { context: 'everyday', text: 'What do you think about the new café down the street?' },
      { context: 'professional', text: "Hi, it's Daniel calling — is now a good time to talk?" },
      { context: 'everyday', text: "Anyway, I should get going — it was great catching up!" },
      { context: 'everyday', text: "Didn't you enjoy the movie? I thought it was great." },
      { context: 'professional', text: "That's a fair point, though I'd lean the other way." },
      { context: 'storytelling', text: 'She wasn\'t sure how to end the call politely, so she just said, "Well, I should let you go."' },
      { context: 'everyday', text: 'Are you free to talk, or is this a bad time?' },
      { context: 'everyday', text: "I wouldn't say that's true, actually — I think it depends." },
      { context: 'professional', text: "Thanks for calling — talk again soon." },
    ],
    commonMistakes: [
      '❌ "No, you are wrong" → ✅ "I see what you mean, but I\'d say..." — direct disagreement can sound rude; English usually softens it first.',
      '❌ "Tell me your opinion about this" → ✅ "What do you think about this?" — a direct command sounds blunt where a question sounds like a genuine invitation.',
      '❌ Ending a call abruptly with just "Bye" mid-topic → ✅ "Anyway, I should get going — talk soon!" — signal the end before the actual goodbye.',
      '❌ "Is good time to talk?" → ✅ "Is now a good time to talk?" — the question needs "now" and the article/structure filled in.',
      '❌ Treating "you know" and "I mean" as errors to avoid completely → ✅ Using them occasionally, naturally — they\'re normal fillers in real spoken English, not mistakes, though overusing any filler can sound unfocused.',
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: 'Which is the most polite way to disagree in conversation?',
        options: ['No, you are wrong.', "I see what you mean, but I'd say...", "That's stupid.", 'Whatever.'],
        correctIndex: 1,
        explanation: 'Softening phrases like "I see what you mean, but..." keep disagreement polite and constructive.',
      },
      {
        type: 'fill',
        prompt: 'Complete the polite question: "___ do you think about the new plan?"',
        acceptedAnswers: ['What'],
        explanation: '"What do you think about...?" is a standard, polite way to ask for an opinion.',
      },
      {
        type: 'mcq',
        prompt: 'Which phrase signals you are about to end a conversation politely?',
        options: ['Bye.', 'Anyway, I should get going.', 'Stop talking now.', 'I have to go, goodbye forever.'],
        correctIndex: 1,
        explanation: '"Anyway, I should get going" signals the wind-down before the actual goodbye, which feels less abrupt.',
      },
      {
        type: 'mcq',
        prompt: "What's wrong with: \"Is good time to talk?\"",
        options: [
          'Nothing is wrong',
          'It\'s missing "now" and "a": "Is now a good time to talk?"',
          'It should be "Is time good to talk?"',
          '"talk" should be "talking"',
        ],
        correctIndex: 1,
        explanation: 'The natural phrasing includes "now" and the article "a": "Is now a good time to talk?"',
      },
      {
        type: 'fill',
        prompt: 'Complete a phone opener: "Hi, it\'s Daniel ___."',
        acceptedAnswers: ['calling'],
        explanation: '"It\'s [name] calling" is a standard, natural way to identify yourself on the phone.',
      },
      {
        type: 'mcq',
        prompt: 'Which sentence is correctly formed for asking someone\'s opinion?',
        options: ['Tell me your opinion this.', 'What do you think about this?', 'You think what about this?', 'Give opinion about this.'],
        correctIndex: 1,
        explanation: '"What do you think about...?" is the natural, grammatically complete question form.',
      },
      {
        type: 'mcq',
        prompt: 'Which best fits agreeing enthusiastically with someone?',
        options: ['I guess.', 'Exactly! I think so too.', 'Maybe not.', 'Whatever you say.'],
        correctIndex: 1,
        explanation: '"Exactly! I think so too" clearly signals strong agreement.',
      },
      {
        type: 'mcq',
        prompt: "What's the issue with only ever using \"you know\" and \"I mean\" in every single sentence?",
        options: [
          'These fillers are always wrong and should never be used',
          'Occasional use is natural, but overusing any filler in every sentence can sound unfocused',
          'They should only be used in writing, never in speech',
          'They are only correct in formal presentations',
        ],
        correctIndex: 1,
        explanation: 'Fillers like "you know" and "I mean" are natural in moderation, but overusing them can distract from your message.',
      },
      {
        type: 'fill',
        prompt: 'Complete a soft disagreement: "That\'s a fair point, ___ I\'d lean the other way."',
        acceptedAnswers: ['though', 'but'],
        explanation: '"Though" or "but" introduces a polite contrast after acknowledging the other person\'s point.',
      },
    ],
    linkDecks: ['Everyday Vocabulary'],
  },
}

/**
 * Scope note (Content-Depth update): every A1 and A2 module above was
 * expanded to the new depth format — 12-13 tagged examples spanning
 * everyday/professional/storytelling contexts and statement/question/
 * negative forms, 5 "❌ wrong → ✅ right — why" common mistakes, and 9
 * quiz questions mixing mcq/fill with spot-the-error and
 * which-sentence-is-correct phrasing.
 *
 * B1 through C2 (16 modules: Present Perfect vs Past Simple, Conditionals,
 * Phrasal Verbs — Everyday Life, Describing Opinions & Preferences, Idioms
 * & Phrasal Verbs, Passive Voice & Reported Speech, Advanced Conditionals &
 * Wish, Debating & Persuasion, Register & Nuance, Collocations & Natural
 * Phrasing, Advanced Listening — Native Speed, Professional & Work
 * English, Near-Native Idiomatic Fluency, Accent Refinement, Nuanced
 * Writing & Style, Spontaneous Unscripted Speaking) are intentionally left
 * without an entry here for this pass — they still fall back to the
 * existing "coming soon" shell (manual status dropdown, description/notes
 * fields) rather than a half-filled lesson. Writing each of them to the
 * same 12-example/5-mistake/9-question depth is the next chunk of this
 * work.
 */
