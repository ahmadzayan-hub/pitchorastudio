"use client";

import { useMemo } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { scorePrompt } from "@/lib/quality-score";

interface Props {
  text: string;
  className?: string;
}

interface Hint {
  id: string;
  labelKey: DictKey;
}

/**
 * Live, non-blocking writing hints under the textarea.
 *
 * Reuses the same five-dimension score the result card uses (clarity,
 * specificity, structure, audience, format). Shows at most two hints at a
 * time so it never feels nagging. When the prompt looks healthy, it shows a
 * cheerful "looking good" — no chips at all.
 */
export default function InlineLintHints({ text, className }: Props) {
  const t = useT();

  const hints = useMemo<Hint[]>(() => {
    const trimmed = text.trim();
    if (trimmed.length < 12) return [];

    const score = scorePrompt(trimmed);
    const out: Hint[] = [];
    if (score.audience < 8)    out.push({ id: "audience",    labelKey: "lint.hint.audience" });
    if (score.format < 8)      out.push({ id: "format",      labelKey: "lint.hint.format" });
    if (trimmed.split(/\s+/).filter(Boolean).length < 12)
                                out.push({ id: "length",      labelKey: "lint.hint.length" });
    if (score.specificity < 6) out.push({ id: "examples",    labelKey: "lint.hint.examples" });
    if (score.structure < 6 && trimmed.length > 60)
                                out.push({ id: "constraints", labelKey: "lint.hint.constraints" });
    return out.slice(0, 2);
  }, [text]);

  if (text.trim().length < 12) return null;

  return (
    <div className={"mt-2 flex flex-wrap items-center gap-1.5 " + (className ?? "")}>
      {hints.length === 0 ? (
        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {t("lint.empty")}
        </span>
      ) : (
        hints.map((h) => (
          <span
            key={h.id}
            className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
          >
            {t(h.labelKey)}
          </span>
        ))
      )}
    </div>
  );
}
