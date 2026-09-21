import { supabase } from './supabase'
import { VAPID_PUBLIC_KEY } from './constants'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i)
  return output
}

/**
 * Requests notification permission, subscribes the device to Web Push,
 * and stores the subscription so the server can reach this device even
 * when the app is closed. Returns the final permission state.
 */
export async function enablePushNotifications() {
  if (typeof Notification === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported'
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission

  const registration = await navigator.serviceWorker.ready
  // make sure the device is running the latest service worker (with push handlers)
  try {
    await registration.update()
  } catch {
    /* ignore */
  }
  let sub = await registration.pushManager.getSubscription()
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }
  const json = sub.toJSON()
  if (!json.keys?.p256dh || !json.keys?.auth) return 'granted'

  await supabase.from('push_subscriptions').upsert(
    {
      endpoint: sub.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent,
    },
    { onConflict: 'endpoint' }
  )
  return 'granted'
}
