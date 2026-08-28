import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db as firestore } from './firebase'
import { applyBackup, buildBackup, validateBackup, type BackupData } from './backup'

/** Cloud save/load reuses the same BackupData shape as the local JSON
 * export/import (Settings > Backup & Restore) — one document per user
 * holds their whole app snapshot, rather than mirroring every table as
 * live Firestore collections. Simpler and much lower-risk than rewriting
 * every feature's Dexie calls, at the cost of being snapshot-based
 * (last save wins) rather than real-time multi-device sync. */

function backupDocRef(uid: string) {
  if (!firestore) throw new Error('Firestore is not configured')
  return doc(firestore, 'users', uid, 'backup', 'current')
}

export async function saveBackupToCloud(uid: string): Promise<void> {
  const data = await buildBackup()
  await setDoc(backupDocRef(uid), data)
}

export async function loadBackupFromCloud(uid: string): Promise<BackupData | null> {
  const snap = await getDoc(backupDocRef(uid))
  if (!snap.exists()) return null
  const data = snap.data()
  if (!validateBackup(data)) return null
  return data
}

export async function applyCloudBackup(data: BackupData): Promise<void> {
  await applyBackup(data)
}
