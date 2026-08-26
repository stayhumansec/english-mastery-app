export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

export function fireNotification(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: `${import.meta.env.BASE_URL}pwa-192.png`, tag: title })
  } catch {
    // Some browsers (notably iOS Safari outside an installed PWA) don't
    // support the Notification constructor at all — fail silently.
  }
}
