"use client";

export default function LibraryError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-4" aria-hidden="true">📚</div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Library failed to load</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 transition"
        >
          ↺ Try again
        </button>
      </div>
    </main>
  );
}
