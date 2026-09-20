"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { HourlyChart } from "@/components/HourlyChart"
import { badgesForVisitCount, hourlyCounts, isToday } from "@/lib/stats"

type Aggregate = {
  userName: string
  visits: number
  totalMinutes: number
  longest: number
}

type Range = "today" | "all"

export default function StatsPage() {
  const allLogs = useQuery(api.usageLogs.listCompleted)
  const loading = allLogs === undefined
  const [range, setRange] = useState<Range>("today")

  const logs = useMemo(() => {
    if (!allLogs) return []
    return range === "today" ? allLogs.filter((l) => isToday(l.enteredAt)) : allLogs
  }, [allLogs, range])

  const byUser = new Map<string, Aggregate>()
  for (const log of logs) {
    const name = log.userName?.trim() || "Anonim"
    const entry = byUser.get(name) ?? { userName: name, visits: 0, totalMinutes: 0, longest: 0 }
    entry.visits += 1
    entry.totalMinutes += log.durationMinutes ?? 0
    entry.longest = Math.max(entry.longest, log.durationMinutes ?? 0)
    byUser.set(name, entry)
  }
  const leaderboard = [...byUser.values()].sort((a, b) => b.visits - a.visits)
  const longestVisit =
    logs.length > 0
      ? [...logs].sort((a, b) => (b.durationMinutes ?? 0) - (a.durationMinutes ?? 0))[0]
      : undefined
  const autoResetCount = logs.filter((l) => l.autoReset).length
  const hourly = hourlyCounts(logs)

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
            ← Geri
          </Link>
          <h1 className="text-2xl font-black text-white">🏆 Şakacı Liderlik Tablosu</h1>
          <div className="w-14" />
        </div>

        <div className="mb-4 flex justify-center gap-1 rounded-full bg-white/15 p-1">
          {(
            [
              ["today", "Bugün"],
              ["all", "Tüm Zamanlar"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                range === value ? "bg-white text-indigo-700 shadow" : "text-white/80 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            {loading ? (
              <p className="text-center text-slate-500">Yükleniyor…</p>
            ) : logs.length === 0 ? (
              <p className="text-center text-slate-500">
                {range === "today" ? "Bugün henüz kayıt yok. İlk hareketi sen yap!" : "Henüz kayıt yok."}
              </p>
            ) : (
              <div className="space-y-6">
                {longestVisit && (
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                      👑 Rekor: En uzun kalış
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {longestVisit.userName || "Anonim"} — {longestVisit.durationMinutes} dakika
                    </p>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    En çok giren
                  </p>
                  <ol className="space-y-2">
                    {leaderboard.slice(0, 10).map((entry, i) => (
                      <li key={entry.userName} className="rounded-xl bg-slate-50 px-4 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}{" "}
                            {entry.userName}
                          </span>
                          <span className="text-sm text-slate-500">
                            {entry.visits} ziyaret · toplam {entry.totalMinutes} dk
                          </span>
                        </div>
                        <div className="mt-1 flex gap-1">
                          {badgesForVisitCount(entry.visits).map((badge) => (
                            <span
                              key={badge.label}
                              title={badge.label}
                              className="rounded-full bg-white px-1.5 py-0.5 text-xs shadow-sm"
                            >
                              {badge.emoji} {badge.label}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {autoResetCount > 0 && (
                  <p className="text-center text-xs text-slate-400">
                    {autoResetCount} kez unutulup otomatik sıfırlandı 🙈
                  </p>
                )}
              </div>
            )}
          </div>

          {!loading && logs.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Saatlere göre yoğunluk
              </p>
              <HourlyChart counts={hourly} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
