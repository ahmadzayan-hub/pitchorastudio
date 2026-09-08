"use client";

import { useMemo, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { reconstructPromptLocal, type Intent } from "@/lib/local-engine";
import type { TargetModel } from "@/lib/types";
import { estimateTokens } from "@/lib/token-estimator";

interface Props {
  raw: string;
  intent: Intent;
  qa: Array<{ question: string; answer: string }>;
  targetModel: TargetModel | string;
  sessionId: string | null;
}

type VariantId = "concise" | "detailed";

/**
 * A/B variant card.
 *
 * Generates two flavours of the same prompt — a Concise one (raw + intent
 * scaffold, no clarification answers) and a Detailed one (full QA-injected
 * version). The user picks the winner; the choice POSTs to /api/feedback as
 * a structured comment ("variant_winner: concise|detailed") so the platform
 * learns which length lands better per intent over time.
 */
export default function VariantComparison({
  raw, intent, qa, targetModel, sessionId
}: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [winner, setWinner] = useState<VariantId | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<VariantId | null>(null);

  const concise = useMemo(
    () =>
      reconstructPromptLocal({
        raw, intent, qa: [], targetModel, locale
      }).final_prompt,
    [raw, intent, targetModel, locale]
  );
  const detailed = useMemo(
    () =>
      reconstructPromptLocal({
        raw, intent, qa, targetModel, locale
      }).final_prompt,
    [raw, intent, qa, targetModel, locale]
  );

  async function copy(id: VariantId, text: string) {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }

  async function pick(id: VariantId) {
    if (busy || winner) return;
    setBusy(true);
    setWinner(id);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: 1,
          session_id: sessionId && sessionId !== "local" ? sessionId : null,
          intent,
          target_model: targetModel,
          locale,
          comment: `variant_winner: ${id}`
        })
      });
    } catch {
      /* swallow — UI already shows the winner */
    } finally {
      setBusy(false);
    }
  }

  const variants: Array<{
    id: VariantId;
    title: import("@/lib/i18n/dictionaries").DictKey;
    blurb: import("@/lib/i18n/dictionaries").DictKey;
    text: string;
    tone: string;
  }> = [
    {
      id: "concise",
      title: "variant.concise.title",
      blurb: "variant.concise.blurb",
      text: concise,
      tone: "from-sky-50 to-sky-100/60 border-sky-200 dark:from-sky-900/20 dark:to-sky-900/10 dark:border-sky-800"
    },
    {
      id: "detailed",
      title: "variant.detailed.title",
      blurb: "variant.detailed.blurb",
      text: detailed,
      tone: "from-violet-50 to-violet-100/60 border-violet-200 dark:from-violet-900/20 dark:to-violet-900/10 dark:border-violet-800"
    }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-sm font-medium">{t("variant.title")}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t("variant.hint")}</p>
        </div>
        {winner && (
          <span className="text-xs text-emerald-700 dark:text-emerald-400">
            ✓ {t("variant.winner_recorded")}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {variants.map((v) => {
          const tokens = estimateTokens(v.text);
          const isWinner = winner === v.id;
          return (
            <div
              key={v.id}
              className={
                "rounded-xl border bg-gradient-to-br p-3 flex flex-col " +
                v.tone +
                (isWinner ? " ring-2 ring-emerald-500" : "")
              }
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="text-sm font-semibold">{t(v.title)}</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{t(v.blurb)}</p>
                </div>
                <span className="text-[10px] text-slate-500 tabular-nums">~{tokens} tok</span>
              </div>
              <pre className="mt-2 whitespace-pre-wrap p-2 text-[12.5px] leading-relaxed font-mono bg-white/60 dark:bg-slate-950/40 rounded max-h-72 overflow-auto flex-1">
{v.text}
              </pre>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => void copy(v.id, v.text)}
                  className="btn-ghost text-[11px] px-2.5 py-1 border border-slate-300 dark:border-slate-700"
                >
                  {copied === v.id ? t("ws.copied") : t("ws.btn.copy")}
                </button>
                <button
                  onClick={() => void pick(v.id)}
                  disabled={Boolean(winner) || busy}
                  className="btn-primary text-[11px] px-2.5 py-1"
                >
                  {isWinner ? t("variant.picked") : t("variant.pick")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
