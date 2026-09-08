"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { QualityBreakdown } from "@/lib/quality-score";
import type { MethodId } from "@/lib/prompt-methods";
import { getMethod } from "@/lib/prompt-methods";

interface MetaAnalysis {
  score: QualityBreakdown;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  improved_prompt: string;
  recommended_method: MethodId;
  word_count: number;
}

interface Props {
  prompt: string;
  intent?: string;
  onUseImproved?: (improved: string) => void;
}

const SCORE_COLORS: Record<QualityBreakdown["tier"], string> = {
  low:       "text-rose-600 dark:text-rose-400",
  mid:       "text-amber-600 dark:text-amber-400",
  high:      "text-emerald-600 dark:text-emerald-400",
  excellent: "text-brand-600 dark:text-brand-400",
};

const SCORE_RING_COLORS: Record<QualityBreakdown["tier"], string> = {
  low:       "#ef4444",
  mid:       "#f59e0b",
  high:      "#10b981",
  excellent: "#6366f1",
};

const DIM_LABELS_EN: Record<string, string> = {
  clarity: "Clarity", specificity: "Specificity", structure: "Structure",
  audience: "Audience", format: "Format", role: "Role",
  constraints: "Constraints", tone: "Tone", examples: "Examples",
  anti_hallucination: "Accuracy",
};
const DIM_LABELS_AR: Record<string, string> = {
  clarity: "الوضوح", specificity: "التحديد", structure: "البنية",
  audience: "الجمهور", format: "الصيغة", role: "الدور",
  constraints: "القيود", tone: "الأسلوب", examples: "الأمثلة",
  anti_hallucination: "الدقة",
};

export default function MetaPromptPanel({ prompt, intent, onUseImproved }: Props) {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const [analysis, setAnalysis] = useState<MetaAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"score" | "improved">("score");

  const analyse = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/meta-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, locale, intent }),
      });
      if (!res.ok) throw new Error("fetch failed");
      setAnalysis(await res.json());
      setTab("score");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [prompt, locale, intent, loading]);

  async function copyImproved() {
    if (!analysis?.improved_prompt) return;
    try {
      await navigator.clipboard.writeText(analysis.improved_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  const dims = ["clarity","specificity","structure","audience","format","role","constraints","tone","examples","anti_hallucination"] as const;

  return (
    <div className="card border-2 border-brand-100 dark:border-brand-900/40 overflow-hidden p-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-50/60 to-violet-50/40 dark:from-brand-950/40 dark:to-violet-950/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg" aria-hidden="true">🧠</span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {ar ? "محلّل الموجِّه الذكي" : "AI Prompt Intelligence"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ar ? "تحليل وتحسين موجِّهك بدقة 100٪" : "Analyse & improve your prompt with 100% accuracy"}
              </p>
            </div>
          </div>
          <button
            onClick={analyse}
            disabled={loading || !prompt.trim()}
            className="btn-primary text-xs px-4 py-2 gap-1.5 disabled:opacity-40"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {ar ? "جارٍ التحليل…" : "Analysing…"}
              </>
            ) : (
              <>
                <span>🔍</span>
                {ar ? "حلّل الآن" : "Analyse Prompt"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="m-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-3 text-sm text-rose-700 dark:text-rose-300">
          {ar ? "تعذّر التحليل. تحقق من الاتصال وحاول مجددًا." : "Analysis failed. Check your connection and try again."}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div>
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {(["score", "improved"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "flex-1 py-2.5 text-xs font-semibold transition-all border-b-2",
                  tab === t
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                ].join(" ")}
              >
                {t === "score"
                  ? (ar ? "📊 التقييم" : "📊 Score")
                  : (ar ? "✨ النسخة المحسّنة" : "✨ Improved")}
              </button>
            ))}
          </div>

          {tab === "score" && (
            <div className="p-4 space-y-4">
              {/* Score ring + tier */}
              <div className="flex items-center gap-5">
                <ScoreRing score={analysis.score.total} color={SCORE_RING_COLORS[analysis.score.tier]} />
                <div>
                  <div className={`text-2xl font-black ${SCORE_COLORS[analysis.score.tier]}`}>
                    {analysis.score.total}<span className="text-sm font-medium text-slate-400">/100</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {ar
                      ? { low: "يحتاج تحسين", mid: "جيد", high: "ممتاز", excellent: "استثنائي" }[analysis.score.tier]
                      : { low: "Needs work", mid: "Good", high: "Excellent", excellent: "Outstanding" }[analysis.score.tier]
                    }
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {analysis.word_count} {ar ? "كلمة" : "words"}
                  </div>
                  {analysis.recommended_method && (
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 text-[11px] font-semibold px-2 py-0.5">
                      {getMethod(analysis.recommended_method).emoji}{" "}
                      {ar ? getMethod(analysis.recommended_method).name_ar : getMethod(analysis.recommended_method).name_en}
                    </div>
                  )}
                </div>
              </div>

              {/* 10-dimension bars */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {dims.map((dim) => {
                  const val = analysis.score[dim] as number;
                  const pct = (val / 10) * 100;
                  const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-rose-400";
                  return (
                    <div key={dim}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {ar ? DIM_LABELS_AR[dim] : DIM_LABELS_EN[dim]}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{val}/10</span>
                      </div>
                      <div className="quality-bar-track">
                        <div className={`quality-bar-fill ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-3">
                {analysis.strengths.length > 0 && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-800 p-3">
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                      ✅ {ar ? "نقاط القوة" : "Strengths"}
                    </div>
                    <ul className="space-y-1">
                      {analysis.strengths.slice(0, 4).map((s, i) => (
                        <li key={i} className="text-xs text-emerald-800 dark:text-emerald-300 flex gap-1.5">
                          <span>·</span><span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.weaknesses.length > 0 && (
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-900/15 border border-rose-100 dark:border-rose-800 p-3">
                    <div className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">
                      ⚠️ {ar ? "نقاط الضعف" : "Weaknesses"}
                    </div>
                    <ul className="space-y-1">
                      {analysis.weaknesses.slice(0, 4).map((w, i) => (
                        <li key={i} className="text-xs text-rose-800 dark:text-rose-300 flex gap-1.5">
                          <span>·</span><span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Improvements */}
              {analysis.improvements.length > 0 && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 p-3">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                    💡 {ar ? "التحسينات المقترحة" : "Recommended Improvements"}
                  </div>
                  <ol className="space-y-1 list-decimal list-inside">
                    {analysis.improvements.slice(0, 5).map((imp, i) => (
                      <li key={i} className="text-xs text-amber-800 dark:text-amber-300">{imp}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {tab === "improved" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ar ? "نسخة محسّنة مع إضافة الأقسام المفقودة" : "Enhanced version with missing sections added"}
                </p>
                <div className="flex gap-2">
                  <button onClick={copyImproved} className="btn-ghost text-xs border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 gap-1">
                    {copied ? "✓" : "📋"} {ar ? "نسخ" : "Copy"}
                  </button>
                  {onUseImproved && (
                    <button
                      onClick={() => onUseImproved(analysis.improved_prompt)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      {ar ? "استخدم هذا" : "Use This"}
                    </button>
                  )}
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 p-4 max-h-[400px] overflow-auto leading-relaxed">
                {analysis.improved_prompt}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && !error && (
        <div className="p-6 text-center text-slate-400 dark:text-slate-500">
          <div className="text-4xl mb-2" aria-hidden="true">🧠</div>
          <p className="text-sm">
            {ar
              ? "اضغط 'حلّل الآن' لتحليل موجِّهك وتحسينه"
              : "Press 'Analyse Prompt' to get a deep quality assessment"}
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0" aria-hidden="true">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
      <circle
        cx="36" cy="36" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
      />
      <text x="36" y="40" textAnchor="middle" className="text-xs font-black" fontSize="14" fontWeight="800" fill={color}>
        {score}
      </text>
    </svg>
  );
}
