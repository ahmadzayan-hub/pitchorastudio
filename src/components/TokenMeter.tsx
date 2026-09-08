"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import {
  estimateTokenRange,
  fitFor,
  formatTokens,
  MODEL_LIMITS,
  type FitTier
} from "@/lib/token-estimator";
import { getModel } from "@/lib/ai-models";
import type { TargetModel } from "@/lib/types";

interface Props {
  text: string;
  /** Either a legacy TargetModel or a new AI_MODELS id. */
  model: TargetModel | string;
  className?: string;
}

/** Look up context window + label for any model id. */
function limitsFor(modelId: string) {
  const m = getModel(modelId);
  if (m) {
    return { label: m.name, context: m.context };
  }
  // Legacy TargetModel fallback
  const legacy = MODEL_LIMITS[modelId as TargetModel];
  if (legacy) return legacy;
  return MODEL_LIMITS.generic;
}

const TIER_CLASS: Record<FitTier, { bar: string; text: string; bg: string; ring: string }> = {
  ok:   { bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20",  ring: "ring-emerald-200 dark:ring-emerald-800" },
  warn: { bar: "bg-amber-500",   text: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-900/20",    ring: "ring-amber-200 dark:ring-amber-800" },
  over: { bar: "bg-rose-500",    text: "text-rose-700 dark:text-rose-300",    bg: "bg-rose-50 dark:bg-rose-900/20",      ring: "ring-rose-200 dark:ring-rose-800" }
};

/**
 * Compact token-budget meter shown beneath a generated prompt.
 *
 * Reads the active target model and the prompt text, then renders an estimate
 * (mid + ± range) and a small bar against the model's documented context
 * window. Colour-coded so users see at a glance whether the prompt fits.
 */
export default function TokenMeter({ text, model, className }: Props) {
  const t = useT();
  const range = estimateTokenRange(text);
  const limits = limitsFor(model);
  // fitFor now also accepts the resolved context window directly so we can
  // compute the warn / over thresholds against any model.
  const ratio = Math.min(1, range.mid / limits.context);
  const tier: FitTier =
    ratio >= 0.85 ? "over" : ratio >= 0.6 ? "warn" : "ok";
  const tone = TIER_CLASS[tier];
  // fitFor still supported on legacy TargetModel ids; reference it so the
  // import stays meaningful for tooling that follows imports.
  void fitFor;

  return (
    <div
      className={
        "rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 " + tone.bg + " " + (className ?? "")
      }
      role="group"
      aria-label={t("tokens.aria", { count: range.mid, model: limits.label })}
    >
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className={"text-xs font-semibold " + tone.text}>{t("tokens.label")}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {limits.label} · {formatTokens(limits.context)} {t("tokens.context")}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 flex-wrap">
        <div className="flex items-baseline gap-1">
          <span className={"text-xl font-bold tabular-nums " + tone.text}>
            {formatTokens(range.mid)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            ±{formatTokens(range.high - range.low)}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({formatTokens(range.low)}–{formatTokens(range.high)} {t("tokens.tokens")})
        </span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" aria-hidden="true">
        <div
          className={"h-full transition-[width] duration-500 " + tone.bar}
          style={{ width: `${Math.max(2, ratio * 100)}%` }}
        />
      </div>

      <p className={"mt-2 text-[11px] " + tone.text}>
        {tier === "ok"   && t("tokens.fit.ok",   { pct: Math.round(ratio * 100) })}
        {tier === "warn" && t("tokens.fit.warn", { pct: Math.round(ratio * 100) })}
        {tier === "over" && t("tokens.fit.over", { pct: Math.round(ratio * 100) })}
      </p>
    </div>
  );
}
