import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import type { QuizQuestion } from '../lib/types'
import { QUIZ_PASS_THRESHOLD } from '../lib/lessonContent'
import Confetti from './motion/Confetti'

export default function Quiz({
  questions,
  color = 'var(--accent)',
  onComplete,
}: {
  questions: QuizQuestion[]
  color?: string
  onComplete: (scorePct: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [fillValue, setFillValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState<number | null>(null)
  const [burst, setBurst] = useState(0)

  const question = questions[index]

  const isCorrect = (() => {
    if (!answered) return false
    if (question.type === 'mcq') return selected === question.correctIndex
    return question.acceptedAnswers.some((a) => a.trim().toLowerCase() === fillValue.trim().toLowerCase())
  })()

  const answerMcq = (i: number) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === (question as Extract<QuizQuestion, { type: 'mcq' }>).correctIndex) {
      setCorrectCount((c) => c + 1)
    }
  }

  const submitFill = () => {
    if (answered || !fillValue.trim()) return
    setAnswered(true)
    const correct = (question as Extract<QuizQuestion, { type: 'fill' }>).acceptedAnswers.some(
      (a) => a.trim().toLowerCase() === fillValue.trim().toLowerCase(),
    )
    if (correct) setCorrectCount((c) => c + 1)
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      const finalCorrect = correctCount
      const pct = Math.round((finalCorrect / questions.length) * 100)
      setFinished(pct)
      if (pct >= QUIZ_PASS_THRESHOLD) setBurst((b) => b + 1)
      onComplete(pct)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setFillValue('')
    setAnswered(false)
  }

  const retry = () => {
    setIndex(0)
    setSelected(null)
    setFillValue('')
    setAnswered(false)
    setCorrectCount(0)
    setFinished(null)
  }

  if (finished !== null) {
    return (
      <div className="relative space-y-3 text-center">
        <Confetti trigger={burst} />
        <p className="text-3xl">{finished >= QUIZ_PASS_THRESHOLD ? '🎉' : '💪'}</p>
        <p className="text-lg font-bold">
          You scored {finished}% ({correctCount}/{questions.length})
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {finished >= QUIZ_PASS_THRESHOLD
            ? 'Nice work — that clears the pass threshold for this lesson!'
            : "Not quite at the 70% pass threshold yet — take another look at the lesson and try again."}
        </p>
        <button onClick={retry} className="btn btn-secondary px-4 py-1.5 text-sm">
          Retry quiz
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)]">
        <span>Question {index + 1} / {questions.length}</span>
        <span>{correctCount} correct so far</span>
      </div>
      <p className="font-bold">{question.prompt}</p>

      {question.type === 'mcq' ? (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            let style: CSSProperties = { borderColor: 'var(--border)' }
            if (answered) {
              if (i === question.correctIndex) style = { borderColor: 'var(--accent)', background: 'var(--accent-soft)' }
              else if (i === selected) style = { borderColor: '#ef4444', background: '#fee2e2' }
            }
            return (
              <button
                key={i}
                onClick={() => answerMcq(i)}
                disabled={answered}
                className="w-full rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition-colors disabled:cursor-default"
                style={style}
              >
                {opt}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitFill()}
            disabled={answered}
            placeholder="Type your answer…"
            className="flex-1 rounded-xl border-2 border-[var(--border)] bg-transparent px-3 py-2 text-sm disabled:opacity-60"
          />
          {!answered && (
            <button onClick={submitFill} className="btn px-4 py-2 text-sm text-white" style={{ background: color }}>
              Check
            </button>
          )}
        </div>
      )}

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 text-sm"
          style={{ background: isCorrect ? 'var(--accent-soft)' : '#fee2e2' }}
        >
          <p className="font-bold" style={{ color: isCorrect ? 'var(--accent-dark)' : '#dc2626' }}>
            {isCorrect ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="mt-1 text-[var(--text)]">{question.explanation}</p>
        </motion.div>
      )}

      {answered && (
        <button onClick={next} className="btn px-4 py-1.5 text-sm text-white" style={{ background: color }}>
          {index + 1 >= questions.length ? 'See my score' : 'Next question'}
        </button>
      )}
    </div>
  )
}
