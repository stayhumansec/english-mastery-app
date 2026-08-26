import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../lib/db'
import ProgressBar from '../../components/ProgressBar'
import { CEFR_LEVELS, type CefrLevel, type ModuleStatus, type RoadmapModule } from '../../lib/types'
import { Plus, Trash2 } from 'lucide-react'

const STATUS_LABEL: Record<ModuleStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
}

function levelProgress(modules: RoadmapModule[]): number {
  if (modules.length === 0) return 0
  const done = modules.filter((m) => m.status === 'done').length
  const inProgress = modules.filter((m) => m.status === 'in_progress').length
  return ((done + inProgress * 0.5) / modules.length) * 100
}

export default function Roadmap() {
  const modules = useLiveQuery(() => db.modules.orderBy('order').toArray(), [])
  const [addingFor, setAddingFor] = useState<CefrLevel | null>(null)

  if (!modules) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  const overall = levelProgress(modules)

  const addModule = async (level: CefrLevel, title: string) => {
    if (!title.trim()) return
    const maxOrder = modules.reduce((m, mod) => Math.max(m, mod.order), 0)
    await db.modules.add({
      id: uuid(),
      level,
      title: title.trim(),
      description: '',
      status: 'not_started',
      notes: '',
      order: maxOrder + 1,
      createdAt: Date.now(),
    })
    setAddingFor(null)
  }

  const updateModule = async (id: string, patch: Partial<RoadmapModule>) => {
    await db.modules.update(id, patch)
  }

  const deleteModule = async (id: string) => {
    await db.modules.delete(id)
  }

  const moveModule = async (mod: RoadmapModule, direction: -1 | 1) => {
    const siblings = modules
      .filter((m) => m.level === mod.level)
      .sort((a, b) => a.order - b.order)
    const idx = siblings.findIndex((m) => m.id === mod.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= siblings.length) return
    const other = siblings[swapIdx]
    await db.modules.update(mod.id, { order: other.order })
    await db.modules.update(other.id, { order: mod.order })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">CEFR Roadmap</h1>
        <p className="text-sm text-[var(--text-muted)]">A1 → C2 curriculum tracker</p>
        <div className="mt-3 max-w-sm">
          <ProgressBar value={overall} label="Overall progress" />
        </div>
      </div>

      {CEFR_LEVELS.map((level) => {
        const levelModules = modules
          .filter((m) => m.level === level)
          .sort((a, b) => a.order - b.order)
        return (
          <section key={level} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{level}</h2>
              <button
                onClick={() => setAddingFor(level)}
                className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                <Plus size={14} /> Add module
              </button>
            </div>
            <div className="mb-3 max-w-sm">
              <ProgressBar value={levelProgress(levelModules)} />
            </div>

            {addingFor === level && (
              <AddModuleForm
                onCancel={() => setAddingFor(null)}
                onSubmit={(title) => addModule(level, title)}
              />
            )}

            <div className="space-y-2">
              {levelModules.map((mod) => (
                <ModuleRow
                  key={mod.id}
                  mod={mod}
                  onUpdate={(patch) => updateModule(mod.id, patch)}
                  onDelete={() => deleteModule(mod.id)}
                  onMove={(dir) => moveModule(mod, dir)}
                />
              ))}
              {levelModules.length === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No modules yet.</p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function AddModuleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (title: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  return (
    <form
      className="mb-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(title)
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Module title"
        className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
      />
      <button type="submit" className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white">
        Add
      </button>
      <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-[var(--text-muted)]">
        Cancel
      </button>
    </form>
  )
}

function ModuleRow({
  mod,
  onUpdate,
  onDelete,
  onMove,
}: {
  mod: RoadmapModule
  onUpdate: (patch: Partial<RoadmapModule>) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-[var(--border)] p-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button onClick={() => onMove(-1)} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">▲</button>
          <button onClick={() => onMove(1)} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">▼</button>
        </div>
        <button className="flex-1 text-left" onClick={() => setExpanded((v) => !v)}>
          <span className="font-medium">{mod.title}</span>
        </button>
        <select
          value={mod.status}
          onChange={(e) => onUpdate({ status: e.target.value as ModuleStatus })}
          className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs"
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button onClick={onDelete} className="text-[var(--text-muted)] hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 pl-6">
          <textarea
            value={mod.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
          />
          <textarea
            value={mod.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Notes / resource links"
            rows={2}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      )}
    </div>
  )
}
