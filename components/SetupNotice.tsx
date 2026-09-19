export function SetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <p className="mb-2 text-4xl">🛠️</p>
        <h1 className="mb-2 text-xl font-black text-slate-900">Convex henüz bağlı değil</h1>
        <p className="text-sm text-slate-600">
          Bir terminalde <code className="rounded bg-slate-100 px-1.5 py-0.5">npx convex dev</code>{" "}
          çalıştır (bkz. <code className="rounded bg-slate-100 px-1.5 py-0.5">README.md</code>),
          sonra bu sayfayı yenile.
        </p>
      </div>
    </main>
  )
}
