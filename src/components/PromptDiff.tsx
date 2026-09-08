"use client";

import { useMemo } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { diffPrompts, diffSummary } from "@/lib/prompt-diff";

interface Props {
  raw: string;
  final: string;
  className?: string;
}

/** Renders the line-level diff with added lines highlighted in emerald. */
export default function PromptDiff({ raw, final, className }: Props) {
  const t = useT();
  const lines = useMemo(() => diffPrompts(raw, final), [raw, final]);
  const summary = useMemo(() => diffSummary(raw, final), [raw, final]);

  return (
    <details className={"card p-0 " + (className ?? "")}>
      <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-medium">{t("diff.title")}</span>
        <span className="text-xs text-emerald-700 tabular-nums">
          +{summary.added} / {summary.total} {t("diff.lines")} ({summary.pct}%)
        </span>
      </summary>
      <div className="border-t border-slate-200 max-h-80 overflow-auto font-mono text-[12.5px] leading-relaxed">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              "flex items-start gap-2 px-3 py-0.5 " +
              (l.kind === "added" ? "bg-emerald-50" : "")
            }
          >
            <span
              aria-hidden="true"
              className={
                "select-none w-4 text-end shrink-0 " +
                (l.kind === "added" ? "text-emerald-600 font-bold" : "text-slate-300")
              }
            >
              {l.kind === "added" ? "+" : " "}
            </span>
            <span className="whitespace-pre-wrap break-words">{l.text || " "}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
