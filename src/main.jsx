import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './store/AppContext'
import './index.css'
import { captureInstallPrompt } from './lib/install'

// PWA: installable app icon + offline shell + self-updating
captureInstallPrompt()
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // when a NEW service worker takes control (an update), reload once —
    // this makes every deployment appear without any manual step
    let refreshing = false
    const hadController = !!navigator.serviceWorker.controller
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing || !hadController) return
      refreshing = true
      window.location.reload()
    })

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        const check = () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {})
        }
        // installed apps resume from memory without a navigation —
        // check for updates every time the app becomes visible/focused
        document.addEventListener('visibilitychange', check)
        window.addEventListener('focus', check)
        setInterval(check, 30 * 60 * 1000)
        check()
      })
      .catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
