"use client";

import { useMemo, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { reconstructPromptLocal, type Intent } from "@/lib/local-engine";
import type { TargetModel } from "@/lib/types";
import { estimateTokens, MODEL_LIMITS } from "@/lib/token-estimator";

interface Props {
  raw: string;
  intent: Intent;
  qa: Array<{ question: string; answer: string }>;
}

const COMPARED: TargetModel[] = ["chatgpt", "claude", "gemini"];

const MODEL_LABEL: Record<TargetModel, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  copilot: "Copilot",
  generic: "Generic"
};

/**
 * One-click side-by-side comparison.
 *
 * Renders the same raw + answers reconstructed for each of three popular
 * models, so the user can pick the format that suits their workflow. All
 * generation happens in the local engine — fast, deterministic, free.
 */
export default function ModelComparison({ raw, intent, qa }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<TargetModel | null>(null);

  const variants = useMemo(() => {
    if (!open) return null;
    return COMPARED.map((model) => {
      const result = reconstructPromptLocal({ raw, intent, qa, targetModel: model, locale });
      return {
        model,
        text: result.final_prompt,
        tokens: estimateTokens(result.final_prompt)
      };
    });
  }, [open, raw, intent, qa, locale]);

  async function copy(model: TargetModel, text: string) {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(model);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-sm font-medium">{t("compare.title")}</div>
          <p className="text-xs text-slate-500 mt-0.5">{t("compare.hint")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={raw.trim().length < 3}
          className="btn-ghost border border-slate-300 text-xs"
        >
          {open ? t("compare.hide") : t("compare.show")}
        </button>
      </div>

      {open && variants && (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {variants.map((v) => (
            <div key={v.model} className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900/40 dark:border-slate-700 flex flex-col">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold">{MODEL_LABEL[v.model]}</span>
                <span className="text-[10px] text-slate-500 tabular-nums">
                  ~{v.tokens} / {Math.round(MODEL_LIMITS[v.model].context / 1000)}k
                </span>
                <button
                  type="button"
                  onClick={() => void copy(v.model, v.text)}
                  className="btn-ghost text-[11px] px-2 py-0.5"
                >
                  {copied === v.model ? t("ws.copied") : t("ws.btn.copy")}
                </button>
              </div>
              <pre className="flex-1 whitespace-pre-wrap p-3 text-[12px] leading-relaxed max-h-72 overflow-auto font-mono">
{v.text}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
