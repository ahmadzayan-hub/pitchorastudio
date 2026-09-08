/**
 * Browser-side history of recent prompts (no backend required).
 *
 * Phase-1 trial: every user — even anonymous, even offline — gets a record
 * of their last few prompts so they can pick up where they left off. Stored
 * in `localStorage` with a hard cap so it can't grow unboundedly.
 */

const KEY = "po_history_v1";
const MAX_ENTRIES = 20;

export interface LocalHistoryEntry {
  id: string;
  ts: number;
  raw: string;
  intent: string | null;
  target_model: string | null;
  final_prompt: string | null;
  rating?: -1 | 0 | 1;
  /** True when the user has starred this prompt to keep it in their library. */
  bookmarked?: boolean;
}

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const t = "__po_test__";
    window.localStorage.setItem(t, t);
    window.localStorage.removeItem(t);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadHistory(): LocalHistoryEntry[] {
  const s = safeStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is LocalHistoryEntry =>
        e && typeof e.id === "string" && typeof e.ts === "number" && typeof e.raw === "string"
    );
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: Omit<LocalHistoryEntry, "id" | "ts">): LocalHistoryEntry {
  const s = safeStorage();
  const stamped: LocalHistoryEntry = {
    ...entry,
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now()
  };
  if (!s) return stamped;
  const next = [stamped, ...loadHistory()].slice(0, MAX_ENTRIES);
  try {
    s.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — ignore */
  }
  return stamped;
}

export function clearHistory() {
  const s = safeStorage();
  if (s) s.removeItem(KEY);
}

export function removeHistoryEntry(id: string) {
  const s = safeStorage();
  if (!s) return;
  const next = loadHistory().filter((e) => e.id !== id);
  try {
    s.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * Flip a single entry's bookmarked flag and persist. Bookmarked items are
 * the user's "saved library" — surfaced separately on the workspace and
 * survive a "Clear" of un-starred history.
 */
export function toggleBookmark(id: string): boolean {
  const s = safeStorage();
  const list = loadHistory();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  const next = list.map((e, i) =>
    i === idx ? { ...e, bookmarked: !e.bookmarked } : e
  );
  if (s) {
    try { s.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  return !list[idx].bookmarked;
}

/** Clears un-starred entries; preserves the user's saved library. */
export function clearUnstarred() {
  const s = safeStorage();
  if (!s) return;
  const next = loadHistory().filter((e) => e.bookmarked);
  try { s.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
}
