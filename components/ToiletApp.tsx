"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getExistingSubscription, isPushSupported, requestPushSubscription } from "@/lib/push-client"
import { averageDurationMinutes } from "@/lib/stats"
import { BellIcon } from "@/components/icons"
import { InstallPromptBanner } from "@/components/InstallPromptBanner"
import { Toast, type ToastTone } from "@/components/Toast"

const JOKES_AVAILABLE = [
  "Yol açık, hadi bakalım 🚀",
  "Taht boş, kral sensin 👑",
  "Şu an dünyanın en sakin yeri burası",
  "Fırsat bu fırsat!",
  "Zil çalmadan yetiş 🔔",
  "Bu sefer kimse önünü kesmez",
  "Nöbetçi öğretmen bile bilmiyor, hadi git",
  "Kuşlar bile bu kadar özgür değil",
  "İçeride hiç kimse yok, tam sana göre",
  "Öğretmenler odası kadar sakin, hatta daha sakin",
  "Bu fırsatı kaçırma, teneffüs kısa sürer",
]

const JOKES_OCCUPIED = [
  "Sabır, güzellik ister 🧘",
  "İçeride ciddi işler dönüyor olabilir",
  "Bekleme odasına hoş geldin",
  "Bu arada bir kahve alsan?",
  "Zil çalarsa suç bizde değil",
  "Nöbetçi öğretmen sırada, sen de sıraya gir",
  "Bu kadar sabır dersin de yok herhalde",
  "Koridor turu atmanın tam zamanı",
  "İçeride kim var bilmiyoruz ama uzun sürüyor",
  "Bir sonraki teneffüse kadar sürebilir (umarım sürmez)",
  "Mutluluğun yolu tuvalette uzun kalmaktan geçer",
]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function ToiletApp() {
  const status = useQuery(api.toilet.getStatus)
  const queue = useQuery(api.queue.list) ?? []
  const rawLogs = useQuery(api.usageLogs.listCompleted)
  const avgMinutes = useMemo(() => averageDurationMinutes(rawLogs ?? []), [rawLogs])

  const enterMutation = useMutation(api.toilet.enter)
  const exitMutation = useMutation(api.toilet.exit)
  const forceResetMutation = useMutation(api.toilet.forceReset)
  const subscribeMutation = useMutation(api.pushSubscriptions.subscribe)
  const unsubscribeMutation = useMutation(api.pushSubscriptions.unsubscribe)
  const joinQueueMutation = useMutation(api.queue.join)
  const leaveQueueMutation = useMutation(api.queue.leave)

  const [userName, setUserName] = useState("")
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState<number | null>(null)
  const [browserSub, setBrowserSub] = useState<PushSubscription | null>(null)
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null)
  const wasOccupiedRef = useRef<boolean | null>(null)

  const subscriptionDoc = useQuery(
    api.pushSubscriptions.findByEndpoint,
    browserSub ? { endpoint: browserSub.endpoint } : "skip",
  )

  function showToast(message: string, tone: ToastTone = "error") {
    setToast({ message, tone })
  }

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (isPushSupported()) {
      getExistingSubscription().then(setBrowserSub)
    }
  }, [])

  useEffect(() => {
    if (status === undefined) return
    if (wasOccupiedRef.current === true && status?.isOccupied === false) {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
    }
    wasOccupiedRef.current = status?.isOccupied ?? false
  }, [status])

  const joke = useMemo(
    () => pick(status?.isOccupied ? JOKES_OCCUPIED : JOKES_AVAILABLE),
    [status?.isOccupied],
  )

  useEffect(() => {
    if (!status?.isOccupied || !status.occupiedSince) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [status?.isOccupied, status?.occupiedSince])

  const elapsedSeconds =
    status?.isOccupied && status.occupiedSince && now
      ? Math.max(0, Math.floor((now - status.occupiedSince) / 1000))
      : 0

  const estimatedRemainingMinutes =
    avgMinutes !== null ? avgMinutes - Math.floor(elapsedSeconds / 60) : null

  async function handleEnter() {
    setBusy(true)
    try {
      await enterMutation({ userName, subscriptionId: subscriptionDoc?._id })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      showToast(
        msg.includes("already_occupied")
          ? "Birileri tam senden önce girdi galiba 😅"
          : "Bir şeyler ters gitti, tekrar dene.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleExit() {
    setBusy(true)
    try {
      await exitMutation({})
      showToast("Çıkış kaydedildi, sağ ol! 👋", "success")
    } catch {
      showToast("Çıkış kaydedilemedi, tekrar dene.")
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleNotifications() {
    setBusy(true)
    try {
      if (browserSub) {
        await unsubscribeMutation({ endpoint: browserSub.endpoint })
        await browserSub.unsubscribe()
        setBrowserSub(null)
        showToast("Bildirimler kapatıldı", "success")
      } else {
        const sub = await requestPushSubscription()
        const json = sub.toJSON()
        await subscribeMutation({
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
          userName,
        })
        setBrowserSub(sub)
        showToast("Bildirimler açıldı 🔔", "success")
      }
    } catch (err) {
      console.error(err)
      showToast("Bildirim izni alınamadı. Tarayıcı/telefon ayarlarından izin verildiğinden emin ol.")
    } finally {
      setBusy(false)
    }
  }

  async function handleJoinQueue() {
    if (!userName.trim()) {
      showToast("Sıraya girmek için önce ismini yaz.")
      return
    }
    setBusy(true)
    try {
      await joinQueueMutation({ userName, subscriptionId: subscriptionDoc?._id })
      showToast("Sıraya eklendin, boşalınca haber veririz 🎉", "success")
    } finally {
      setBusy(false)
    }
  }

  async function handleLeaveQueue(id: (typeof queue)[number]["_id"]) {
    await leaveQueueMutation({ id })
  }

  async function handleForceReset() {
    const ok = confirm(
      "Durumu zorla sıfırlamak istediğine emin misin? Bunu sadece durum takılı kaldıysa (biri çıkışı işaretlemeden gittiyse) kullan.",
    )
    if (!ok) return
    setBusy(true)
    try {
      await forceResetMutation({})
      showToast("Durum sıfırlandı", "success")
    } catch {
      showToast("Sıfırlanamadı, tekrar dene.")
    } finally {
      setBusy(false)
    }
  }

  if (status === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600">
        <p className="animate-pulse text-lg text-white/90">Yükleniyor…</p>
      </main>
    )
  }

  const isAvailable = !status?.isOccupied
  const notifOn = !!browserSub

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-700 ${
        isAvailable
          ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"
          : "bg-gradient-to-br from-rose-600 via-red-600 to-orange-600"
      }`}
    >
      <div className="w-full max-w-md rounded-[2rem] bg-white/95 p-6 shadow-2xl backdrop-blur">
        <InstallPromptBanner />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
            <span className="text-3xl leading-none">🚽</span>
            MAE Tuvalet
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/istatistik"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              📊 İstatistik
            </Link>
            <button
              onClick={handleToggleNotifications}
              disabled={busy}
              title={notifOn ? "Bildirimleri kapat" : "Bildirimleri aç"}
              className={`rounded-full p-2.5 transition ${
                notifOn ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
              }`}
            >
              <BellIcon muted={!notifOn} />
            </button>
          </div>
        </div>

        <div
          className={`mb-6 rounded-[1.75rem] p-8 text-center shadow-inner transition-all ${
            isAvailable
              ? "bg-gradient-to-br from-emerald-400 to-teal-500"
              : "bg-gradient-to-br from-rose-500 to-orange-500"
          }`}
        >
          <div className="mb-3 animate-bounce text-7xl drop-shadow-md">
            {isAvailable ? "✅" : "🚫"}
          </div>
          <h2 className="mb-1 text-3xl font-black text-white">{isAvailable ? "Müsait" : "Dolu"}</h2>
          <p className="text-sm font-medium text-white/90">{joke}</p>

          {!isAvailable && status && (
            <div className="mt-5 space-y-1.5">
              <p className="text-lg font-bold text-white">👤 {status.currentUserName}</p>
              <p className="font-mono text-2xl font-black text-white">{formatElapsed(elapsedSeconds)}</p>
              {estimatedRemainingMinutes !== null && (
                <p className="text-xs font-medium text-white/80">
                  {estimatedRemainingMinutes > 0
                    ? `≈ ${estimatedRemainingMinutes} dk sonra boşalabilir (ortalamaya göre)`
                    : "Ortalamadan uzun sürüyor, her an bitebilir"}
                </p>
              )}
            </div>
          )}
        </div>

        {isAvailable ? (
          <div className="space-y-3">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="İsmin (opsiyonel)"
              className="h-12 w-full rounded-2xl border-2 border-slate-200 px-4 text-slate-900 outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleEnter}
              disabled={busy}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "İşleniyor…" : "Giriş Yap"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleExit}
              disabled={busy}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 font-bold text-white shadow-lg transition hover:from-rose-600 hover:to-orange-600 active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "İşleniyor…" : "Çıkış Yap"}
            </button>

            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Bekleme sırası {queue.length > 0 && `· ${queue.length} kişi`}
              </p>
              {queue.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {queue.map((q, i) => (
                    <li
                      key={q._id}
                      className="flex items-center justify-between text-sm text-slate-700"
                    >
                      <span>
                        {i + 1}. {q.userName}
                      </span>
                      <button
                        onClick={() => handleLeaveQueue(q._id)}
                        className="text-xs text-slate-400 hover:text-rose-500"
                      >
                        çık
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="İsmin"
                  className="h-10 flex-1 rounded-xl border-2 border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-indigo-400"
                />
                <button
                  onClick={handleJoinQueue}
                  disabled={busy}
                  className="h-10 rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
                >
                  Sıraya gir
                </button>
              </div>
            </div>

            <button
              onClick={handleForceReset}
              disabled={busy}
              className="w-full text-center text-xs text-slate-400 underline-offset-2 hover:text-rose-500 hover:underline"
            >
              Takıldı mı? Elle sıfırla
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-xs text-slate-400">
          Son güncelleme: {status ? new Date(status.lastUpdated).toLocaleTimeString("tr-TR") : "—"}
        </p>
      </div>

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </main>
  )
}
