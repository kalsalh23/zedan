// Shared install-prompt state: capture beforeinstallprompt early and expose it app-wide
let deferred = null
const listeners = new Set()

export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    listeners.forEach((f) => f(true))
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    try {
      localStorage.setItem('mb_installed', '1')
    } catch {}
    listeners.forEach((f) => f(false))
  })
}

export const getInstallPrompt = () => deferred
export const onInstallAvailability = (f) => {
  listeners.add(f)
  return () => listeners.delete(f)
}

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const canInstall = () => !!deferred || (isIOS() && !isStandalone())

export async function requestInstall() {
  if (!deferred) return 'unavailable'
  deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  listeners.forEach((f) => f(false))
  return outcome // 'accepted' | 'dismissed'
}

export const markDismissed = () => {
  try {
    localStorage.setItem('mb_install_dismissed', String(Date.now()))
  } catch {}
}

export const dismissedRecently = () => {
  try {
    const ts = Number(localStorage.getItem('mb_install_dismissed') || 0)
    return Date.now() - ts < 1000 * 60 * 60 * 48 // re-offer after 48h
  } catch {
    return false
  }
}

export const isInstalled = () => {
  try {
    return localStorage.getItem('mb_installed') === '1'
  } catch {
    return false
  }
}
