"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "mae-tuvalet-install-dismissed"

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function initialVisible() {
  if (typeof window === "undefined") return false
  try {
    if (localStorage.getItem(DISMISS_KEY) === "1") return false
  } catch {}
  return !isStandalone()
}

export function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(initialVisible)
  const [ios] = useState(() => typeof navigator !== "undefined" && isIOS())

  useEffect(() => {
    if (!visible) return
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [visible])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {}
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    dismiss()
  }

  if (!visible) return null
  if (!ios && !deferredPrompt) return null

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
      <span className="text-xl">📲</span>
      <div className="flex-1">
        {ios ? (
          <p>
            Uygulama gibi kullan: <span className="font-semibold">Paylaş</span> ikonuna, sonra{" "}
            <span className="font-semibold">&ldquo;Ana Ekrana Ekle&rdquo;</span>&apos;ye dokun.
          </p>
        ) : (
          <p>Bunu telefonuna uygulama gibi ekleyebilirsin.</p>
        )}
      </div>
      {!ios && deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="shrink-0 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Yükle
        </button>
      )}
      <button
        onClick={dismiss}
        className="shrink-0 text-indigo-400 hover:text-indigo-600"
        aria-label="Kapat"
      >
        ✕
      </button>
    </div>
  )
}
