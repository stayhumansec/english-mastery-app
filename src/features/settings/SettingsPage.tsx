import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { db } from '../../lib/db'
import { notificationsSupported, requestNotificationPermission } from '../../lib/notifications'
import { staggerContainer, fadeUpItem } from '../../lib/motionPresets'
import { FEATURE_COLORS, type AppSettings } from '../../lib/types'

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('app'), [])
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    notificationsSupported() ? Notification.permission : 'unsupported',
  )
  const [newTime, setNewTime] = useState('07:00')

  if (!settings) return <p className="text-sm text-[var(--text-muted)]">Loading…</p>

  const update = (patch: Partial<AppSettings>) => db.settings.update('app', patch)

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
      <motion.h1 variants={fadeUpItem} className="text-2xl font-black" style={{ color }}>Settings ⚙️</motion.h1>

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

      <motion.p variants={fadeUpItem} className="text-xs text-[var(--text-muted)]">
        Notifications only fire while this app is open in a tab or installed window — see the
        README for platform limitations (iOS Safari in particular restricts background
        notifications for web apps).
      </motion.p>
    </motion.div>
  )
}
