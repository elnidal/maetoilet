import type { Doc } from "@/convex/_generated/dataModel"

export function isToday(timestamp: number): boolean {
  const now = new Date()
  const d = new Date(timestamp)
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function averageDurationMinutes(logs: Doc<"usageLogs">[]): number | null {
  const durations = logs.map((l) => l.durationMinutes).filter((d): d is number => d != null)
  if (durations.length === 0) return null
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

/** Saat başına giriş sayısı (0-23, yerel saat). */
export function hourlyCounts(logs: Doc<"usageLogs">[]): number[] {
  const counts = new Array(24).fill(0)
  for (const log of logs) {
    counts[new Date(log.enteredAt).getHours()]++
  }
  return counts
}

export type Badge = { emoji: string; label: string }

const MILESTONES: [number, Badge][] = [
  [1, { emoji: "🎉", label: "İlk Giriş" }],
  [5, { emoji: "🏅", label: "5. Giriş" }],
  [10, { emoji: "🥇", label: "10. Giriş" }],
  [25, { emoji: "👑", label: "Efsane (25+)" }],
]

export function badgesForVisitCount(visits: number): Badge[] {
  return MILESTONES.filter(([threshold]) => visits >= threshold).map(([, badge]) => badge)
}
