import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../lib/db'
import { newCardScheduleDefaults } from '../../lib/sm2'
import type { MiniStory } from '../../lib/types'

function cleanWord(token: string): string {
  return token.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/gi, '')
}

export default function MiniStoryReader({ story }: { story: MiniStory }) {
  const [openWord, setOpenWord] = useState<string | null>(null)
  const lookups = useLiveQuery(() => db.wordLookups.toArray(), [])
  const lookupMap = new Map((lookups ?? []).map((l) => [l.word, l]))

  const tokens = story.text.split(/(\s+)/)

  const recordLookup = async (word: string) => {
    const existing = await db.wordLookups.get(word)
    await db.wordLookups.put({
      word,
      lookedUpCount: (existing?.lookedUpCount ?? 0) + 1,
      addedFlashcardId: existing?.addedFlashcardId,
      lastSeenAt: Date.now(),
    })
  }

  const addToFlashcards = async (word: string, meaning: string) => {
    const cardId = uuid()
    await db.flashcards.add({
      id: cardId,
      deck: 'Everyday Vocabulary',
      level: story.level,
      front: word,
      back: meaning,
      example: story.text,
      tags: ['from-mini-story'],
      createdAt: Date.now(),
      ...newCardScheduleDefaults(),
    })
    await db.wordLookups.update(word, { addedFlashcardId: cardId })
  }

  const glossaryWords = Object.keys(story.glossary)
  const lookedUpCount = glossaryWords.filter((w) => (lookupMap.get(w)?.lookedUpCount ?? 0) > 0).length

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{story.title}</h3>
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {lookedUpCount}/{glossaryWords.length} words looked up
        </span>
      </div>
      <p className="text-sm leading-loose">
        {tokens.map((token, i) => {
          if (/^\s+$/.test(token)) return token
          const key = cleanWord(token)
          const meaning = story.glossary[key]
          if (!meaning) return <span key={i}>{token}</span>
          const lookup = lookupMap.get(key)
          return (
            <span key={i} className="relative">
              <button
                onClick={() => {
                  setOpenWord(openWord === key ? null : key)
                  recordLookup(key)
                }}
                className="rounded px-0.5 font-semibold underline decoration-dotted"
                style={{
                  color: 'var(--teal)',
                  background: lookup?.lookedUpCount ? 'var(--teal-soft)' : 'transparent',
                }}
              >
                {token}
              </button>
              {openWord === key && (
                <span className="absolute left-0 top-full z-10 mt-1 block w-56 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] p-2 text-xs font-normal normal-case text-[var(--text)] shadow-lg">
                  <span className="mb-1 block">{meaning}</span>
                  {lookup?.addedFlashcardId ? (
                    <span className="text-[var(--text-muted)]">✓ in flashcards</span>
                  ) : (
                    <button
                      onClick={() => addToFlashcards(key, meaning)}
                      className="btn px-2 py-1 text-xs text-white"
                      style={{ background: 'var(--teal)' }}
                    >
                      Add to flashcards
                    </button>
                  )}
                </span>
              )}
            </span>
          )
        })}
      </p>
    </div>
  )
}
