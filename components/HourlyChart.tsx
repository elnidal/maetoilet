const LABELED_HOURS = new Set([0, 4, 8, 12, 16, 20])

export function HourlyChart({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts)

  return (
    <div>
      <div className="flex gap-1">
        {counts.map((count, hour) => (
          <div key={hour} className="group relative flex h-28 flex-1 flex-col justify-end">
            {count > 0 && (
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {count}
              </span>
            )}
            <div
              className={`w-full rounded-t-sm transition-colors ${
                count > 0 ? "bg-indigo-600 group-hover:bg-indigo-500" : "bg-slate-100"
              }`}
              style={{ height: count > 0 ? `${Math.max(6, (count / max) * 100)}%` : "2px" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {counts.map((_, hour) => (
          <div key={hour} className="flex-1 text-center text-[9px] text-slate-400">
            {LABELED_HOURS.has(hour) ? hour : ""}
          </div>
        ))}
      </div>
    </div>
  )
}
