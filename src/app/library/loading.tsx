export default function LibraryLoading() {
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse mb-6" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        ))}
      </div>
    </main>
  );
}
