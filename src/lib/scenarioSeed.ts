import type { ScenarioPrompt } from './types'

export const SCENARIO_PROMPT_SEED: Array<Omit<ScenarioPrompt, 'id'>> = [
  // Everyday
  { level: 'A1', category: 'everyday', prompt: 'Introduce yourself: your name, where you live, and what you do.' },
  { level: 'A2', category: 'everyday', prompt: 'Describe your morning routine, step by step.' },
  { level: 'B1', category: 'everyday', prompt: 'Talk about your favorite weekend activity and why you enjoy it.' },
  { level: 'B2', category: 'everyday', prompt: 'Describe a change you made to your daily habits and how it affected you.' },
  { level: 'C1', category: 'everyday', prompt: 'Explain how your daily routine has changed over the last five years.' },
  { level: 'C2', category: 'everyday', prompt: 'Describe an everyday habit of yours that a foreigner might find unusual, and why.' },

  // Professional
  { level: 'A2', category: 'professional', prompt: 'Describe your job or studies in a few sentences.' },
  { level: 'B1', category: 'professional', prompt: 'Explain what you did at work yesterday.' },
  { level: 'B2', category: 'professional', prompt: 'Describe a project you are proud of and what made it successful.' },
  { level: 'C1', category: 'professional', prompt: 'Explain a technical concept from your job to a non-expert.' },
  { level: 'C1', category: 'professional', prompt: 'Give feedback on a colleague\'s work, balancing praise and constructive criticism.' },
  { level: 'C2', category: 'professional', prompt: 'Pitch an idea to a skeptical stakeholder, anticipating their objections.' },

  // Storytelling
  { level: 'A2', category: 'storytelling', prompt: 'Tell the story of your last vacation, in order.' },
  { level: 'B1', category: 'storytelling', prompt: 'Describe a memorable mistake you made and what you learned from it.' },
  { level: 'B2', category: 'storytelling', prompt: 'Tell a story about a time something unexpected happened to you.' },
  { level: 'C1', category: 'storytelling', prompt: 'Describe a turning point in your life and how it changed your perspective.' },
  { level: 'C2', category: 'storytelling', prompt: 'Tell a story with a twist ending, building suspense as you go.' },

  // Debate / opinion
  { level: 'B1', category: 'debate', prompt: 'Do you think remote work is better than working in an office? Give your opinion and one reason.' },
  { level: 'B2', category: 'debate', prompt: 'Argue for or against social media being good for society.' },
  { level: 'C1', category: 'debate', prompt: 'Present both sides of a controversial topic, then explain which side you find more convincing and why.' },
  { level: 'C2', category: 'debate', prompt: 'Defend a position you personally disagree with, as persuasively as you can.' },
]
