import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

// Détection iOS
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

// Détection si déjà installé (mode standalone)
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
}

const DISMISSED_KEY = 'permisflow_pwa_dismissed'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Déjà installé ou déjà refusé → on ne montre rien
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) return

    if (isIOS()) {
      // Sur iOS, pas d'événement beforeinstallprompt — on montre le guide manuel
      const timer = setTimeout(() => setShowIOSGuide(true), 3000)
      return () => clearTimeout(timer)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as typeof deferredPrompt)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setShowIOSGuide(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  // ── Bannière Chrome / Android ─────────────────────────────────────────────
  if (showBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A]">Installer PermisFlow</p>
            <p className="text-xs text-[#64748B]">Accès rapide depuis votre écran d'accueil</p>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Installer
          </button>
          <button onClick={handleDismiss} className="shrink-0 p-1 text-[#94A3B8] hover:text-[#64748B]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── Guide iOS ─────────────────────────────────────────────────────────────
  if (showIOSGuide) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-[#0F172A]">Installer PermisFlow</p>
            <button onClick={handleDismiss} className="p-1 text-[#94A3B8] hover:text-[#64748B]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#64748B] mb-3">
            Ajoutez l'app à votre écran d'accueil pour un accès rapide :
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#0F172A]">
              <div className="w-6 h-6 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
                <Share className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              <span>Appuyez sur <strong>Partager</strong> dans Safari</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#0F172A]">
              <div className="w-6 h-6 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0 text-[#2563EB] font-bold text-[10px]">+</div>
              <span>Puis <strong>« Sur l'écran d'accueil »</strong></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
