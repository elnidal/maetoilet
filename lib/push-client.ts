"use client"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null
  return navigator.serviceWorker.register("/sw.js")
}

export async function getExistingSubscription() {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

/** Tarayıcıdan push izni ister ve PushManager aboneliğini oluşturur. Sunucuya kaydetmez. */
export async function requestPushSubscription() {
  if (!isPushSupported()) throw new Error("push_not_supported")

  const permission = await Notification.requestPermission()
  if (permission !== "granted") throw new Error("permission_denied")

  const registration = await navigator.serviceWorker.ready
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })
}
