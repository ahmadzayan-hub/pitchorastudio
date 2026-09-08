"use client";

import { useT, useI18n } from "@/lib/i18n/I18nProvider";
import { scorePrompt, type QualityBreakdown } from "@/lib/quality-score";

interface Props {
  finalText: string;
  rawText: string;
  className?: string;
}

const TIER_STYLES: Record<QualityBreakdown["tier"], { ring: string; text: string; bg: string; badge: string }> = {
  low:       { ring: "stroke-rose-500",    text: "text-rose-700 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-900/15",    badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" },
  mid:       { ring: "stroke-amber-500",   text: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/15",   badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  high:      { ring: "stroke-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/15", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
  excellent: { ring: "stroke-brand-500",   text: "text-brand-600 dark:text-brand-400",   bg: "bg-brand-50 dark:bg-brand-900/15",   badge: "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400" },
};

const DIM_KEYS_EN: Record<string, string> = {
  clarity: "Clarity", specificity: "Specificity", structure: "Structure",
  audience: "Audience", format: "Format", role: "Role",
  constraints: "Constraints", tone: "Tone", examples: "Examples", anti_hallucination: "Accuracy",
};
const DIM_KEYS_AR: Record<string, string> = {
  clarity: "الوضوح", specificity: "التحديد", structure: "البنية",
  audience: "الجمهور", format: "الصيغة", role: "الدور",
  constraints: "القيود", tone: "الأسلوب", examples: "الأمثلة", anti_hallucination: "الدقة",
};

const DIMS = ["clarity","specificity","structure","audience","format","role","constraints","tone","examples","anti_hallucination"] as const;

export default function QualityBadge({ finalText, rawText, className }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const ar = locale === "ar";
  const score = scorePrompt(finalText);
  const before = scorePrompt(rawText);
  const tier = TIER_STYLES[score.tier];
  const tierLabel = t(
    score.tier === "excellent" ? "quality.tier.high" :
    score.tier === "high" ? "quality.tier.high" :
    score.tier === "mid"  ? "quality.tier.mid"  : "quality.tier.low"
  );
  const delta = Math.max(0, score.total - before.total);

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score.total / 100);

  return (
    <div
      className={`rounded-2xl border p-4 flex items-start gap-4 ${tier.bg} border-slate-200 dark:border-slate-700 ${className ?? ""}`}
      role="group"
      aria-label={t("quality.score_aria", { score: score.total })}
    >
      {/* Score ring */}
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" className="flex-shrink-0">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-700" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-[stroke-dashoffset] duration-700 ${tier.ring}`}
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="900" fill="currentColor" className={tier.text}>
          {score.total}
        </text>
      </svg>

      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("quality.label")}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.badge}`}>{tierLabel}</span>
          {delta > 0 && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {t("quality.delta", { delta })}
            </span>
          )}
        </div>

        {/* 10-dimension bars in 2 columns */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {DIMS.map((dim) => {
            const v = score[dim] as number;
            const pct = (v / 10) * 100;
            return (
              <div key={dim} className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-14 sm:w-16 truncate">
                  {ar ? DIM_KEYS_AR[dim] : DIM_KEYS_EN[dim]}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${
                      pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-slate-400 w-4 text-end">{v}</span>
              </div>
            );
          })}
        </div>

        {/* Strengths preview */}
        {score.strengths.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {score.strengths.slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                ✓ {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
