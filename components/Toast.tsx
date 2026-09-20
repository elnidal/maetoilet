"use client"

export type ToastTone = "error" | "success"

export function Toast({ message, tone }: { message: string; tone: ToastTone }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        role="status"
        className={`animate-toast-in pointer-events-auto max-w-sm rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl ${
          tone === "error" ? "bg-rose-600" : "bg-emerald-600"
        }`}
      >
        {message}
      </div>
    </div>
  )
}
