import type { Pattern, PatternSegment, RecognitionToken } from './types'

function seg(text: string, role?: PatternSegment['role']): PatternSegment {
  return { text, role }
}

function tok(text: string, isTarget = false): RecognitionToken {
  return { text, isTarget }
}

/** Core pattern library, hand-authored and tagged so highlighting can be
 * rendered programmatically (no markdown parsing needed). Spans A1-B2. */
export const PATTERN_SEED: Array<Omit<Pattern, 'id' | 'createdAt'>> = [
  {
    name: 'Simple Present for habits & facts',
    level: 'A1',
    category: 'Verb Tenses',
    structureTemplate: [
      seg('Subject', 'subject'),
      seg(' + '),
      seg('verb (+s/es)', 'verb'),
      seg(' + '),
      seg('(frequency word)'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('She', 'subject'), seg(' '), seg('walks', 'verb'), seg(' to work every day.')],
      },
      {
        context: 'professional',
        segments: [seg('Our team', 'subject'), seg(' '), seg('reviews', 'verb'), seg(' progress ', undefined), seg('every Friday', 'object'), seg('.')],
      },
      {
        context: 'storytelling',
        segments: [seg('The old man', 'subject'), seg(' '), seg('tells', 'verb'), seg(' '), seg('the same story', 'object'), seg(' every winter.')],
      },
    ],
    commonMistake: 'Forgetting the -s/-es ending with he/she/it (saying "she walk" instead of "she walks").',
    ruleExplanation: 'Add -s/-es to the verb whenever the subject is he, she, or it — that ending is what marks the simple present for a habit or fact.',
    contrastWrong: 'She walk to work every day.',
    contrastNote: 'Third-person singular subjects (he/she/it) always need the -s/-es ending in the simple present.',
    recognitionParagraph: [
      tok('Maria'), tok('works', true), tok('in'), tok('a'), tok('hospital.'), tok('She'), tok('starts', true), tok('early'), tok('and'), tok('usually'), tok('finishes', true), tok('by'), tok('six.'), tok('Yesterday'), tok('she'), tok('left'), tok('late'), tok('instead.'),
    ],
  },
  {
    name: 'Basic SVO word order',
    level: 'A1',
    category: 'Word Order',
    structureTemplate: [
      seg('Subject', 'subject'),
      seg(' + '),
      seg('Verb', 'verb'),
      seg(' + '),
      seg('Object', 'object'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('I', 'subject'), seg(' '), seg('made', 'verb'), seg(' '), seg('breakfast', 'object'), seg('.')],
      },
      {
        context: 'professional',
        segments: [seg('The manager', 'subject'), seg(' '), seg('approved', 'verb'), seg(' '), seg('the budget', 'object'), seg('.')],
      },
      {
        context: 'storytelling',
        segments: [seg('The dog', 'subject'), seg(' '), seg('chased', 'verb'), seg(' '), seg('the ball', 'object'), seg(' across the yard.')],
      },
    ],
    commonMistake: 'Putting the object before the verb under the influence of a native-language word order (e.g. "I breakfast made").',
    ruleExplanation: 'English locks its word order: subject, then verb, then object — in that order, almost without exception.',
    contrastWrong: 'Breakfast I made.',
    contrastNote: 'English is a fixed-word-order language — subject and verb almost never move for emphasis the way some languages allow.',
  },
  {
    name: 'Past Simple for finished actions',
    level: 'A2',
    category: 'Verb Tenses',
    structureTemplate: [
      seg('Subject', 'subject'),
      seg(' + '),
      seg('verb-ed / irregular past', 'verb'),
      seg(' + '),
      seg('(time marker)'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('We', 'subject'), seg(' '), seg('watched', 'verb'), seg(' a movie ', undefined), seg('last night', 'object'), seg('.')],
      },
      {
        context: 'professional',
        segments: [seg('The client', 'subject'), seg(' '), seg('signed', 'verb'), seg(' '), seg('the contract', 'object'), seg(' yesterday.')],
      },
      {
        context: 'storytelling',
        segments: [seg('She', 'subject'), seg(' '), seg('left', 'verb'), seg(' '), seg('the village', 'object'), seg(' when she was sixteen.')],
      },
    ],
    commonMistake: 'Mixing in present-tense or base-form verbs for finished past events (e.g. "Yesterday I go to the store").',
    ruleExplanation: 'A finished action tied to a past time marker takes the past-tense verb form — regular -ed, or the irregular past form.',
    contrastWrong: 'Yesterday I go to the store.',
    contrastNote: 'A past time marker ("yesterday", "last night") requires a past-tense verb, not the base form.',
    recognitionParagraph: [
      tok('Last'), tok('month'), tok('we'), tok('visited', true), tok('Lisbon.'), tok('We'), tok('walked', true), tok('along'), tok('the'), tok('coast'), tok('and'), tok('tried', true), tok('the'), tok('local'), tok('food.'), tok('Now'), tok('we'), tok('plan'), tok('our'), tok('next'), tok('trip.'),
    ],
  },
  {
    name: 'Comparative adjectives',
    level: 'A2',
    category: 'Comparatives & Superlatives',
    structureTemplate: [
      seg('Subject A', 'subject'),
      seg(' + '),
      seg('is/are', 'verb'),
      seg(' + '),
      seg('adjective-er / more + adjective', 'object'),
      seg(' + than + Subject B'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('This coffee', 'subject'), seg(' '), seg('is', 'verb'), seg(' '), seg('stronger', 'object'), seg(' than that one.')],
      },
      {
        context: 'professional',
        segments: [seg('This proposal', 'subject'), seg(' '), seg('is', 'verb'), seg(' '), seg('more efficient', 'object'), seg(' than the previous plan.')],
      },
      {
        context: 'storytelling',
        segments: [seg('The second half of the journey', 'subject'), seg(' '), seg('was', 'verb'), seg(' '), seg('harder', 'object'), seg(' than the first.')],
      },
    ],
    commonMistake: 'Doubling the comparative (saying "more better" or "more stronger").',
    ruleExplanation: 'Pick one comparative form per adjective — short adjectives add -er, longer ones take "more" in front — never combine both.',
    contrastWrong: 'This coffee is more stronger than that one.',
    contrastNote: 'Short adjectives take -er; longer adjectives take "more" — never both at once.',
  },
  {
    name: 'a/an vs the',
    level: 'A2',
    category: 'Articles',
    structureTemplate: [
      seg('a/an', 'verb'),
      seg(' + noun — first mention / not specific'),
      seg('   ·   '),
      seg('the', 'verb'),
      seg(' + noun — already known / specific'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('I bought '), seg('a', 'verb'), seg(' book. '), seg('The', 'verb'), seg(' book was excellent.')],
      },
      {
        context: 'professional',
        segments: [seg('We hired '), seg('a', 'verb'), seg(' consultant. '), seg('The', 'verb'), seg(' consultant starts Monday.')],
      },
      {
        context: 'storytelling',
        segments: [seg('There was '), seg('a', 'verb'), seg(' knock at '), seg('the', 'verb'), seg(' door.')],
      },
    ],
    commonMistake: 'Using "the" the first time something is mentioned, before it has been established as specific.',
    ruleExplanation: 'Use "a/an" the first time you mention something; switch to "the" once both speakers know exactly which one you mean.',
    contrastWrong: 'I bought the book yesterday (as the first mention of that book in the conversation).',
    contrastNote: '"The" signals the listener already knows which one you mean — use "a/an" to introduce something new.',
  },
  {
    name: 'Present Perfect for unfinished time',
    level: 'B1',
    category: 'Verb Tenses',
    structureTemplate: [
      seg('Subject', 'subject'),
      seg(' + '),
      seg('have/has', 'verb'),
      seg(' + '),
      seg('past participle', 'verb'),
      seg(' + '),
      seg('(since/for + time)'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('I', 'subject'), seg(' '), seg('have lived', 'verb'), seg(' '), seg('here', 'object'), seg(' for three years.')],
      },
      {
        context: 'professional',
        segments: [seg('She', 'subject'), seg(' '), seg('has worked', 'verb'), seg(' at this company since 2019.')],
      },
      {
        context: 'storytelling',
        segments: [seg('They', 'subject'), seg(' '), seg('have known', 'verb'), seg(' '), seg('each other', 'object'), seg(' since childhood.')],
      },
    ],
    commonMistake: 'Confusing this with the simple past when the time period is still open ("I lived here for three years" implies you no longer do).',
    ruleExplanation: 'Use have/has + past participle when an action started in the past and is still true or ongoing right now.',
    contrastWrong: 'I live here since three years.',
    contrastNote: '"Since/for" pairs with present perfect ("have lived"), not the simple present — the action started in the past and continues now.',
    recognitionParagraph: [
      tok('I'), tok('have worked', true), tok('at'), tok('this'), tok('school'), tok('for'), tok('six'), tok('years.'), tok('My'), tok('colleague'), tok('has taught', true), tok('here'), tok('since'), tok('2015.'), tok('Last'), tok('year'), tok('she'), tok('won'), tok('an'), tok('award.'),
    ],
  },
  {
    name: 'First Conditional (real future possibility)',
    level: 'B1',
    category: 'Conditionals',
    structureTemplate: [
      seg('If'),
      seg(' + '),
      seg('Subject', 'subject'),
      seg(' + '),
      seg('present simple', 'verb'),
      seg(', '),
      seg('Subject', 'subject'),
      seg(' + '),
      seg('will + verb', 'verb'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('If '), seg('it', 'subject'), seg(' '), seg('rains', 'verb'), seg(', '), seg('we', 'subject'), seg(' '), seg('will stay', 'verb'), seg(' home.')],
      },
      {
        context: 'professional',
        segments: [seg('If '), seg('the client', 'subject'), seg(' '), seg('approves', 'verb'), seg(' the plan, '), seg('we', 'subject'), seg(' '), seg('will start', 'verb'), seg(' next week.')],
      },
      {
        context: 'storytelling',
        segments: [seg('If '), seg('she', 'subject'), seg(' '), seg('finds', 'verb'), seg(' the map, '), seg('she', 'subject'), seg(' '), seg('will reach', 'verb'), seg(' the coast by morning.')],
      },
    ],
    commonMistake: 'Using "will" in the if-clause too ("If it will rain, we will stay home").',
    ruleExplanation: 'For a realistic future possibility, keep the if-clause in the present simple — "will" belongs only in the result clause.',
    contrastWrong: 'If it will rain, we will stay home.',
    contrastNote: 'The if-clause stays in the present simple even though it refers to the future — only the result clause takes "will".',
  },
  {
    name: 'Separable phrasal verbs',
    level: 'B1',
    category: 'Phrasal Verbs',
    structureTemplate: [
      seg('Subject', 'subject'),
      seg(' + '),
      seg('verb', 'verb'),
      seg(' + (Object) + '),
      seg('particle', 'verb'),
      seg(' + (Object)'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('Can you '), seg('turn', 'verb'), seg(' '), seg('the light', 'object'), seg(' '), seg('off', 'verb'), seg('?')],
      },
      {
        context: 'professional',
        segments: [seg('Please '), seg('fill', 'verb'), seg(' '), seg('the form', 'object'), seg(' '), seg('out', 'verb'), seg(' before Friday.')],
      },
      {
        context: 'storytelling',
        segments: [seg('He '), seg('picked', 'verb'), seg(' '), seg('the letter', 'object'), seg(' '), seg('up', 'verb'), seg(' and read it twice.')],
      },
    ],
    commonMistake: 'Splitting the verb and particle around a pronoun object incorrectly ("turn off it" instead of "turn it off").',
    ruleExplanation: 'With a pronoun object (it, them, him...), the pronoun must sit between the verb and the particle — "turn it off," never "turn off it."',
    contrastWrong: 'Can you turn off it?',
    contrastNote: 'When the object is a pronoun (it, them, him...), it must go between the verb and the particle, never after both.',
  },
  {
    name: 'Reported statements (backshift)',
    level: 'B1',
    category: 'Reported Speech',
    structureTemplate: [
      seg('Subject', 'subject'),
      seg(' + '),
      seg('said (that)', 'verb'),
      seg(' + '),
      seg('Subject', 'subject'),
      seg(' + '),
      seg('past-tense verb', 'verb'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('She', 'subject'), seg(' '), seg('said', 'verb'), seg(' that '), seg('she', 'subject'), seg(' '), seg('was', 'verb'), seg(' tired.')],
      },
      {
        context: 'professional',
        segments: [seg('The client', 'subject'), seg(' '), seg('said', 'verb'), seg(' that '), seg('they', 'subject'), seg(' '), seg('needed', 'verb'), seg(' more time.')],
      },
      {
        context: 'storytelling',
        segments: [seg('He', 'subject'), seg(' '), seg('said', 'verb'), seg(' that '), seg('he', 'subject'), seg(' '), seg('had seen', 'verb'), seg(' a ghost.')],
      },
    ],
    commonMistake: 'Forgetting to shift the tense back one step ("She said that she is tired" instead of "was tired").',
    ruleExplanation: 'A past reporting verb ("said") pulls the reported verb one tense back in time too — present becomes past, past becomes past perfect.',
    contrastWrong: 'She said that she is tired.',
    contrastNote: 'When the reporting verb is in the past ("said"), the reported verb usually shifts one tense back too.',
  },
  {
    name: 'Second Conditional (hypothetical present)',
    level: 'B2',
    category: 'Conditionals',
    structureTemplate: [
      seg('If'),
      seg(' + '),
      seg('Subject', 'subject'),
      seg(' + '),
      seg('past simple', 'verb'),
      seg(', '),
      seg('Subject', 'subject'),
      seg(' + '),
      seg('would + verb', 'verb'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('If '), seg('I', 'subject'), seg(' '), seg('had', 'verb'), seg(' more time, '), seg('I', 'subject'), seg(' '), seg('would travel', 'verb'), seg(' more.')],
      },
      {
        context: 'professional',
        segments: [seg('If '), seg('we', 'subject'), seg(' '), seg('had', 'verb'), seg(' a bigger budget, '), seg('we', 'subject'), seg(' '), seg('would hire', 'verb'), seg(' another designer.')],
      },
      {
        context: 'storytelling',
        segments: [seg('If '), seg('she', 'subject'), seg(' '), seg('knew', 'verb'), seg(' the truth, '), seg('she', 'subject'), seg(' '), seg('would leave', 'verb'), seg(' immediately.')],
      },
    ],
    commonMistake: 'Using "would" in the if-clause ("If I would have more time...").',
    ruleExplanation: 'For a hypothetical (not real) present situation, the if-clause takes the past simple — "would" stays in the result clause only.',
    contrastWrong: 'If I would have more time, I would travel more.',
    contrastNote: 'The if-clause uses the past simple for a hypothetical present situation — "would" only appears in the result clause.',
  },
  {
    name: 'Past Perfect for an earlier past action',
    level: 'B2',
    category: 'Verb Tenses',
    structureTemplate: [
      seg('Subject', 'subject'),
      seg(' + '),
      seg('had', 'verb'),
      seg(' + '),
      seg('past participle', 'verb'),
      seg(' + (before/after + clause)'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('By the time we arrived, '), seg('the movie', 'subject'), seg(' '), seg('had started', 'verb'), seg('.')],
      },
      {
        context: 'professional',
        segments: [seg('The vendor', 'subject'), seg(' '), seg('had shipped', 'verb'), seg(' '), seg('the order', 'object'), seg(' before we even confirmed it.')],
      },
      {
        context: 'storytelling',
        segments: [seg('She', 'subject'), seg(' '), seg('had already left', 'verb'), seg(' by the time he called.')],
      },
    ],
    commonMistake: 'Using the simple past for both events, which loses the sense of "which happened first" ("The movie started when we arrived").',
    ruleExplanation: 'When two things happened in the past, had + past participle marks the one that happened first, before the other past event.',
    contrastWrong: 'The movie started when we arrived, so we missed the start.',
    contrastNote: 'Past perfect marks the earlier of two past events — use it for the action that finished before the other one began.',
    recognitionParagraph: [
      tok('When'), tok('we'), tok('reached'), tok('the'), tok('station,'), tok('the'), tok('train'), tok('had left', true), tok('already.'), tok('Someone'), tok('told'), tok('us'), tok('it'), tok('had departed', true), tok('early.'), tok('We'), tok('waited'), tok('for'), tok('the'), tok('next'), tok('one.'),
    ],
  },
  {
    name: 'Question word order (inversion)',
    level: 'B2',
    category: 'Word Order',
    structureTemplate: [
      seg('(Wh-word) + '),
      seg('auxiliary', 'verb'),
      seg(' + '),
      seg('Subject', 'subject'),
      seg(' + '),
      seg('verb', 'verb'),
      seg('?'),
    ],
    examples: [
      {
        context: 'everyday',
        segments: [seg('Where '), seg('did', 'verb'), seg(' '), seg('you', 'subject'), seg(' '), seg('go', 'verb'), seg(' last night?')],
      },
      {
        context: 'professional',
        segments: [seg('When '), seg('will', 'verb'), seg(' '), seg('the report', 'subject'), seg(' '), seg('be ready', 'verb'), seg('?')],
      },
      {
        context: 'storytelling',
        segments: [seg('Why '), seg('had', 'verb'), seg(' '), seg('she', 'subject'), seg(' '), seg('never told', 'verb'), seg(' anyone?')],
      },
    ],
    commonMistake: 'Keeping statement word order in a question ("Where you did go?" instead of "Where did you go?").',
    ruleExplanation: 'In a question with an auxiliary, the auxiliary moves in front of the subject — that swap is what makes it a question.',
    contrastWrong: 'Where you did go last night?',
    contrastNote: 'Questions with an auxiliary invert it in front of the subject — the auxiliary comes before, not after, the subject.',
  },
]
