/**
 * Draft auto-save: keep the user's in-progress raw prompt + target model in
 * localStorage so an accidental tab close, a phone reboot, or a navigation
 * away never costs the user their work.
 *
 * Drafts older than DRAFT_TTL_MS are ignored and cleared, so a user who comes
 * back next month doesn't see a stale half-thought as their first impression.
 */

import type { TargetModel } from "@/lib/types";

const KEY = "po_draft_v1";
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface Draft {
  raw: string;
  /** Either a legacy TargetModel or a new AI_MODELS id. */
  model: TargetModel | string;
  ts: number;
}

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadDraft(): Draft | null {
  const s = safeStorage();
  if (!s) return null;
  try {
    const raw = s.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (
      typeof parsed.raw !== "string" ||
      typeof parsed.model !== "string" ||
      typeof parsed.ts !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.ts > DRAFT_TTL_MS) {
      s.removeItem(KEY);
      return null;
    }
    if (!parsed.raw.trim()) return null;
    return parsed as Draft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Omit<Draft, "ts">): void {
  const s = safeStorage();
  if (!s) return;
  try {
    if (!draft.raw.trim()) {
      s.removeItem(KEY);
      return;
    }
    s.setItem(KEY, JSON.stringify({ ...draft, ts: Date.now() }));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clearDraft(): void {
  const s = safeStorage();
  if (!s) return;
  try { s.removeItem(KEY); } catch { /* ignore */ }
}
