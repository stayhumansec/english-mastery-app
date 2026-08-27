import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '../../lib/db'
import { CEFR_LEVELS, LEVEL_COLORS, type CefrLevel } from '../../lib/types'
import Mascot from '../../components/Mascot'
import { easeOut } from '../../lib/motionPresets'

const LEVEL_DESCRIPTIONS: Record<CefrLevel, string> = {
  A1: 'Beginner — greetings, simple present, everyday words',
  A2: 'Elementary — past tense, comparisons, small talk',
  B1: 'Intermediate — experiences, conditionals, opinions',
  B2: 'Upper intermediate — idioms, passive voice, debate',
  C1: 'Advanced — nuance, register, native-speed listening',
  C2: 'Mastery — idiomatic fluency, accent, unscripted speaking',
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState<CefrLevel | 'unsure'>('unsure')
  const firstModule = useLiveQuery(
    () => db.modules.where('level').equals('A1').and((m) => m.order === 0).first(),
    [],
  )

  const finish = async (chosenLevel: CefrLevel | 'unsure') => {
    await db.settings.update('app', {
      onboardingCompleted: true,
      startingLevel: chosenLevel === 'unsure' ? 'A1' : chosenLevel,
    })
  }

  const steps = [
    <WelcomeStep key="welcome" onNext={() => setStep(1)} onSkip={() => finish('unsure')} />,
    <LevelStep key="level" level={level} setLevel={setLevel} onNext={() => setStep(2)} onSkip={() => finish('unsure')} />,
    <PreviewStep key="preview" onNext={() => setStep(3)} onSkip={() => finish(level)} />,
    <LandStep key="land" onFinish={() => finish(level)} firstModuleTitle={firstModule?.title} />,
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="card blob-decoration w-full max-w-md space-y-5 p-6" style={{ ['--blob-color' as string]: 'var(--accent)' }}>
        <div className="blob-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={easeOut}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="blob-content flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-6 rounded-full"
              style={{ background: i === step ? 'var(--accent)' : 'var(--border)' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <Mascot pose="wave" size={88} className="mx-auto" />
      <h1 className="page-title">Welcome to English Mastery!</h1>
      <p className="body-text text-[var(--text-muted)]">
        A personal, guided path from your first words to native-level fluency — lessons that teach,
        flashcards that stick, and practice that builds real speaking and writing skills.
      </p>
      <div className="flex flex-col gap-2">
        <button onClick={onNext} className="btn btn-primary w-full py-2 text-sm">Let's get started</button>
        <button onClick={onSkip} className="text-xs font-semibold text-[var(--text-muted)]">Skip intro</button>
      </div>
    </div>
  )
}

function LevelStep({
  level,
  setLevel,
  onNext,
  onSkip,
}: {
  level: CefrLevel | 'unsure'
  setLevel: (l: CefrLevel | 'unsure') => void
  onNext: () => void
  onSkip: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Mascot pose="neutral" size={64} className="mx-auto" />
        <h1 className="page-title mt-2">Where are you starting from?</h1>
        <p className="body-text text-[var(--text-muted)]">Pick what feels right — you can always adjust later.</p>
      </div>
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {CEFR_LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className="flex w-full items-center gap-2 rounded-xl border-2 p-2 text-left text-sm"
            style={level === l ? { borderColor: LEVEL_COLORS[l], background: `${LEVEL_COLORS[l]}14` } : { borderColor: 'var(--border)' }}
          >
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: LEVEL_COLORS[l] }}>{l}</span>
            <span className="text-[var(--text-muted)]">{LEVEL_DESCRIPTIONS[l]}</span>
          </button>
        ))}
        <button
          onClick={() => setLevel('unsure')}
          className="w-full rounded-xl border-2 border-dashed p-2 text-left text-sm text-[var(--text-muted)]"
          style={level === 'unsure' ? { borderColor: 'var(--accent)' } : { borderColor: 'var(--border)' }}
        >
          Not sure — start me at A1
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={onNext} className="btn btn-primary w-full py-2 text-sm">Continue</button>
        <button onClick={onSkip} className="text-xs font-semibold text-[var(--text-muted)]">Skip intro</button>
      </div>
    </div>
  )
}

function PreviewStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <h1 className="page-title">Your path ahead</h1>
      <p className="body-text text-[var(--text-muted)]">Six levels, each broken into short guided lessons with examples, practice and a quick check.</p>
      <div className="grid grid-cols-3 gap-2">
        {CEFR_LEVELS.map((l) => (
          <div key={l} className="rounded-xl p-2" style={{ background: `${LEVEL_COLORS[l]}18` }}>
            <p className="section-header" style={{ color: LEVEL_COLORS[l] }}>{l}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={onNext} className="btn btn-primary w-full py-2 text-sm">Show me my first lesson</button>
        <button onClick={onSkip} className="text-xs font-semibold text-[var(--text-muted)]">Skip intro</button>
      </div>
    </div>
  )
}

function LandStep({ onFinish, firstModuleTitle }: { onFinish: () => void; firstModuleTitle?: string }) {
  return (
    <div className="space-y-4 text-center">
      <Mascot pose="celebrate" size={88} className="mx-auto" />
      <h1 className="page-title">You're all set!</h1>
      <p className="body-text text-[var(--text-muted)]">
        {firstModuleTitle ? `Your first lesson, "${firstModuleTitle}", is ready on Home.` : 'Your first lesson is ready on Home.'}
      </p>
      <button onClick={onFinish} className="btn btn-primary w-full py-2 text-sm">Go to Home</button>
    </div>
  )
}
