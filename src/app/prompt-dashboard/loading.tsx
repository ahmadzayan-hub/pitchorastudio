export default function DashboardLoading() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
          <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>
    </main>
  );
}
