import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import { notificationsSupported, requestNotificationPermission } from '../../lib/notifications'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { useToast } from '../../components/motion/ToastProvider'
import {
  applyBackup,
  buildBackup,
  downloadBackup,
  getLastBackupAt,
  validateBackup,
} from '../../lib/backup'
import { FEATURE_COLORS, type AppSettings } from '../../lib/types'
import { useAuth } from '../auth/AuthProvider'
import { saveBackupToCloud } from '../../lib/cloudBackup'
import { Download, LogOut, RefreshCw, Upload } from 'lucide-react'

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('app'), [])
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    notificationsSupported() ? Notification.permission : 'unsupported',
  )
  const [newTime, setNewTime] = useState('07:00')
  const [lastBackupAt, setLastBackupAt] = useState(getLastBackupAt())
  const [importError, setImportError] = useState('')
  const [pendingImport, setPendingImport] = useState<{ data: Awaited<ReturnType<typeof buildBackup>>; fileDate: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const { configured, user, signOutUser } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [cloudSyncedAt, setCloudSyncedAt] = useState<Date | null>(null)

  const syncNow = async () => {
    if (!user) return
    setSyncing(true)
    try {
      await saveBackupToCloud(user.uid)
      setCloudSyncedAt(new Date())
      showToast('Synced to your account!', '☁️')
    } catch {
      showToast("Couldn't sync — try again", '⚠️')
    } finally {
      setSyncing(false)
    }
  }

  const handleSignOut = async () => {
    if (user) await saveBackupToCloud(user.uid).catch(() => undefined)
    await signOutUser()
  }

  if (!settings) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  const update = (patch: Partial<AppSettings>) => db.settings.update('app', patch)

  const exportData = async () => {
    const data = await buildBackup()
    downloadBackup(data)
    setLastBackupAt(getLastBackupAt())
    showToast('Backup downloaded!', '💾')
  }

  const pickImportFile = () => fileInputRef.current?.click()

  const onImportFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError('')
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!validateBackup(parsed)) {
        setImportError('This file doesn\'t look like a valid English Mastery backup.')
        return
      }
      setPendingImport({ data: parsed, fileDate: new Date(parsed.exportedAt).toLocaleDateString() })
    } catch {
      setImportError('Could not read that file — make sure it\'s a valid .json backup.')
    }
  }

  const confirmImport = async () => {
    if (!pendingImport) return
    await applyBackup(pendingImport.data)
    setPendingImport(null)
    showToast('Backup restored — reloading…', '✅')
    window.setTimeout(() => window.location.reload(), 600)
  }

  const daysSinceBackup = lastBackupAt ? Math.floor((Date.now() - lastBackupAt) / (24 * 60 * 60 * 1000)) : null

  const enableNotifications = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') update({ remindersEnabled: true })
  }

  const addTime = () => {
    if (settings.reminderTimes.includes(newTime)) return
    update({ reminderTimes: [...settings.reminderTimes, newTime].sort() })
  }

  const removeTime = (time: string) => {
    update({ reminderTimes: settings.reminderTimes.filter((t) => t !== time) })
  }

  const color = FEATURE_COLORS.settings

  return (
    <motion.div className="max-w-xl space-y-6" variants={staggerContainer} initial="hidden" animate="show">
      <motion.h1 variants={fadeUpItem} className="page-title" style={{ color }}>Settings ⚙️</motion.h1>

      <motion.section variants={fadeUpItem} className="card space-y-3 p-4">
        <h2 className="font-bold">Notifications</h2>
        {permission === 'unsupported' && (
          <p className="text-sm text-[var(--text-muted)]">
            This browser doesn't support the Notification API.
          </p>
        )}
        {permission !== 'unsupported' && permission !== 'granted' && (
          <button onClick={enableNotifications} className="btn btn-primary px-3 py-1.5 text-sm">
            Enable browser notifications
          </button>
        )}

        {permission === 'granted' && (
          <>
            <label className="flex items-center justify-between text-sm">
              <span>Study reminders</span>
              <input
                type="checkbox"
                checked={settings.remindersEnabled}
                onChange={(e) => update({ remindersEnabled: e.target.checked })}
              />
            </label>

            <div>
              <p className="mb-1 text-sm text-[var(--text-muted)]">Reminder times</p>
              <div className="mb-2 flex flex-wrap gap-2">
                {settings.reminderTimes.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2 py-1 text-xs"
                  >
                    {t}
                    <button onClick={() => removeTime(t)} className="text-[var(--text-muted)]">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1 text-sm"
                />
                <button onClick={addTime} className="btn btn-secondary px-3 py-1 text-sm">
                  Add time
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between text-sm">
              <span>Nudge me if nothing logged by</span>
              <input
                type="checkbox"
                checked={settings.inactivityReminderEnabled}
                onChange={(e) => update({ inactivityReminderEnabled: e.target.checked })}
              />
            </label>
            <input
              type="time"
              value={settings.inactivityReminderTime}
              onChange={(e) => update({ inactivityReminderTime: e.target.value })}
              className="rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1 text-sm"
            />

            <label className="flex items-center justify-between text-sm">
              <span>Snooze duration (minutes)</span>
              <input
                type="number"
                min={1}
                value={settings.snoozeMinutes}
                onChange={(e) => update({ snoozeMinutes: Number(e.target.value) })}
                className="w-20 rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1 text-sm"
              />
            </label>
          </>
        )}
      </motion.section>

      <motion.section variants={fadeUpItem} className="card space-y-3 p-4">
        <h2 className="font-bold">Timer defaults</h2>
        <label className="flex items-center justify-between text-sm">
          <span>Enable break reminders</span>
          <input
            type="checkbox"
            checked={settings.breakEnabled}
            onChange={(e) => update({ breakEnabled: e.target.checked })}
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>Work block before break (minutes)</span>
          <input
            type="number"
            min={1}
            value={settings.breakWorkMinutes}
            onChange={(e) => update({ breakWorkMinutes: Number(e.target.value) })}
            className="w-20 rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1 text-sm"
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>Break duration (minutes)</span>
          <input
            type="number"
            min={1}
            value={settings.breakDurationMinutes}
            onChange={(e) => update({ breakDurationMinutes: Number(e.target.value) })}
            className="w-20 rounded-xl border-2 border-[var(--border)] bg-transparent px-2 py-1 text-sm"
          />
        </label>
      </motion.section>

      <motion.section variants={fadeUpItem} className="card space-y-3 p-4">
        <h2 className="section-header text-sm">Weekly recap</h2>
        <label className="flex items-center justify-between text-sm">
          <span>Auto-show once per week</span>
          <input
            type="checkbox"
            checked={settings.weeklyRecapAutoShow ?? false}
            onChange={(e) => update({ weeklyRecapAutoShow: e.target.checked })}
          />
        </label>
      </motion.section>

      {configured && (
        <motion.section variants={fadeUpItem} className="card space-y-3 p-4">
          <h2 className="section-header text-sm">Cloud Account</h2>
          {user ? (
            <>
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] font-bold" style={{ color: 'var(--accent-dark)' }}>
                    {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold">{user.displayName ?? 'Signed in'}</p>
                  <p className="body-text text-xs text-[var(--text-muted)]">{user.email}</p>
                </div>
              </div>
              <p className="body-text text-sm text-[var(--text-muted)]">
                {cloudSyncedAt ? `Last synced: ${cloudSyncedAt.toLocaleTimeString()}` : 'Not synced yet this session.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={syncNow} disabled={syncing} className="btn btn-primary px-3 py-1.5 text-sm disabled:opacity-60">
                  <RefreshCw size={14} /> {syncing ? 'Syncing…' : 'Sync now'}
                </button>
                <button onClick={handleSignOut} className="btn btn-secondary px-3 py-1.5 text-sm">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </>
          ) : (
            <p className="body-text text-sm text-[var(--text-muted)]">Not signed in.</p>
          )}
        </motion.section>
      )}

      <motion.section variants={fadeUpItem} className="card space-y-3 p-4">
        <h2 className="section-header text-sm">Backup & Restore</h2>
        <p className="body-text text-sm text-[var(--text-muted)]">
          {lastBackupAt
            ? `Last backup: ${new Date(lastBackupAt).toLocaleDateString()}`
            : "You haven't backed up yet."}
        </p>
        {daysSinceBackup !== null && daysSinceBackup > 14 && (
          <p className="rounded-xl px-3 py-2 text-xs font-semibold" style={{ background: 'var(--orange-soft)', color: 'var(--orange)' }}>
            It's been {daysSinceBackup} days since your last backup — consider exporting your data.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="btn btn-primary px-3 py-1.5 text-sm">
            <Download size={14} /> Export my data
          </button>
          <button onClick={pickImportFile} className="btn btn-secondary px-3 py-1.5 text-sm">
            <Upload size={14} /> Restore from backup
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onImportFileChosen} />
        </div>
        {importError && <p className="text-xs font-semibold text-red-500">{importError}</p>}
      </motion.section>

      {pendingImport && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm space-y-3 p-5">
            <h2 className="section-header text-sm">Restore from backup?</h2>
            <p className="body-text text-sm text-[var(--text-muted)]">
              This will replace all current data with the backup from {pendingImport.fileDate}. This cannot be undone. Continue?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPendingImport(null)} className="btn btn-secondary flex-1 py-2 text-sm">
                Cancel
              </button>
              <button onClick={confirmImport} className="btn flex-1 py-2 text-sm text-white" style={{ background: '#ef4444' }}>
                Replace my data
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.p variants={fadeUpItem} className="text-xs text-[var(--text-muted)]">
        Notifications only fire while this app is open in a tab or installed window — see the
        README for platform limitations (iOS Safari in particular restricts background
        notifications for web apps).
      </motion.p>
    </motion.div>
  )
}
