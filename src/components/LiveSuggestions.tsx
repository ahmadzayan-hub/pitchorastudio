"use client";

import { useEffect, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import {
  suggestForDraft,
  localizedSuggestion,
  type LiveSuggestion
} from "@/lib/live-suggestions";

interface Props {
  text: string;
  /** Called when the user accepts a suggestion — append to the textarea. */
  onApply: (appended: string) => void;
  className?: string;
}

const DEBOUNCE_MS = 250;

/**
 * Live, Grammarly-style suggestion chips above the textarea.
 *
 * Suggestions are computed locally (no network) on every keystroke, with a
 * 250 ms debounce so it doesn't fire on every key. Each chip shows a short
 * label; tapping it appends a markdown block — never replaces the user's
 * text. Every applied suggestion is dismissed (not re-shown that session)
 * so the strip doesn't get noisy.
 */
export default function LiveSuggestions({ text, onApply, className }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [list, setList] = useState<LiveSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = suggestForDraft(text, { locale }, 5).filter(
        (s) => !dismissed.has(s.id)
      );
      setList(next.slice(0, 3));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [text, locale, dismissed]);

  if (text.trim().length < 8 || list.length === 0) return null;

  function apply(s: LiveSuggestion) {
    const loc = localizedSuggestion(s, locale);
    onApply(loc.append);
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(s.id);
      return next;
    });
  }

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <div
      className={"mt-2 flex items-start gap-1.5 flex-wrap " + (className ?? "")}
      role="group"
      aria-label={t("live.label")}
    >
      <span className="text-[11px] text-slate-500 dark:text-slate-400 self-center">
        ✨ {t("live.label")}
      </span>
      {list.map((s) => {
        const loc = localizedSuggestion(s, locale);
        return (
          <span
            key={s.id}
            className="group inline-flex items-stretch rounded-full border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800 overflow-hidden"
            title={loc.preview}
          >
            <button
              type="button"
              onClick={() => apply(s)}
              className="text-[11px] px-2.5 py-1 text-brand-800 dark:text-brand-200 hover:bg-brand-100 dark:hover:bg-brand-900/40"
            >
              {loc.label}
            </button>
            <button
              type="button"
              onClick={() => dismiss(s.id)}
              aria-label={t("live.dismiss")}
              className="px-1.5 text-[11px] text-brand-400 hover:text-rose-600 border-s border-brand-200 dark:border-brand-800"
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  );
}
