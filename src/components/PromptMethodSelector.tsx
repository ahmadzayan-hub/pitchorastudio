"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { PROMPT_METHODS, recommendMethod, getMethod, type MethodId, type PromptMethod } from "@/lib/prompt-methods";

interface Props {
  value: MethodId | null;
  onChange: (id: MethodId) => void;
  rawText?: string;
  intent?: string;
  compact?: boolean;
}

const COMPLEXITY_COLORS = {
  beginner: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  intermediate: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
  advanced: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20",
};
const COMPLEXITY_LABEL_EN = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const COMPLEXITY_LABEL_AR = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };

export default function PromptMethodSelector({ value, onChange, rawText = "", intent, compact = false }: Props) {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const [expanded, setExpanded] = useState<MethodId | null>(null);
  const [autoMode, setAutoMode] = useState(false);

  function handleAutoRecommend() {
    setAutoMode(true);
    const rec = recommendMethod(rawText, intent);
    onChange(rec);
  }

  function handleManual(id: MethodId) {
    setAutoMode(false);
    onChange(id);
  }

  const recommended = rawText.length > 8 ? recommendMethod(rawText, intent) : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {ar ? "أسلوب:" : "Method:"}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleManual(m.id)}
              className={[
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all duration-150",
                value === m.id
                  ? "bg-brand-600 text-white border-brand-600 shadow-brand"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600"
              ].join(" ")}
              title={ar ? m.tagline_ar : m.tagline_en}
            >
              <span>{m.emoji}</span>
              <span>{ar ? m.name_ar : m.name_en}</span>
            </button>
          ))}
          <button
            onClick={handleAutoRecommend}
            className={[
              "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all duration-150",
              autoMode
                ? "bg-fuchsia-600 text-white border-fuchsia-600"
                : "bg-white dark:bg-slate-900 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800 hover:bg-fuchsia-50"
            ].join(" ")}
          >
            ✨ {ar ? "اختيار ذكي" : "Auto-Pick"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {ar ? "اختر أسلوب الموجِّه" : "Choose Prompt Method"}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {ar ? "11 أسلوب احترافي لكتابة الموجّهات" : "11 professional prompt-writing approaches"}
          </p>
        </div>
        <button
          onClick={handleAutoRecommend}
          className={[
            "pill border transition-all text-sm font-semibold gap-2 py-1.5 px-4",
            autoMode
              ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-lg shadow-fuchsia-200 dark:shadow-fuchsia-900/30"
              : "text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20"
          ].join(" ")}
        >
          <span>✨</span>
          <span>{ar ? "اقتراح ذكي" : "Auto-Recommend"}</span>
        </button>
      </div>

      {/* Auto-recommend banner */}
      {autoMode && recommended && (
        <div className="rounded-xl border border-fuchsia-200 dark:border-fuchsia-800 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 p-3 flex items-center gap-2.5 text-sm">
          <span className="text-xl">{getMethod(recommended).emoji}</span>
          <span className="text-fuchsia-800 dark:text-fuchsia-300">
            {ar ? "يُنصح بـ" : "Recommended:"}{" "}
            <strong>{ar ? getMethod(recommended).name_ar : getMethod(recommended).name_en}</strong>
            {" — "}{ar ? getMethod(recommended).tagline_ar : getMethod(recommended).tagline_en}
          </span>
        </div>
      )}

      {/* Method grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PROMPT_METHODS.map((m) => {
          const isSelected = value === m.id;
          const isRec = recommended === m.id && rawText.length > 8;
          return (
            <MethodCard
              key={m.id}
              method={m}
              selected={isSelected}
              recommended={isRec}
              expanded={expanded === m.id}
              onSelect={() => handleManual(m.id)}
              onToggleExpand={() => setExpanded(expanded === m.id ? null : m.id)}
              ar={ar}
            />
          );
        })}
      </div>
    </div>
  );
}

function MethodCard({
  method, selected, recommended, expanded, onSelect, onToggleExpand, ar
}: {
  method: PromptMethod;
  selected: boolean;
  recommended: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  ar: boolean;
}) {
  const complexityLabel = ar ? COMPLEXITY_LABEL_AR[method.complexity] : COMPLEXITY_LABEL_EN[method.complexity];
  const complexityClass = COMPLEXITY_COLORS[method.complexity];

  return (
    <div
      className={[
        "method-card select-none",
        selected
          ? "selected border-brand-500 dark:border-brand-400"
          : recommended
          ? "border-fuchsia-300 dark:border-fuchsia-700 bg-fuchsia-50/40 dark:bg-fuchsia-900/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
      ].join(" ")}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <button className="flex items-center gap-2.5 min-w-0 flex-1 text-start" onClick={onSelect}>
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 text-white ${method.color}`}
            aria-hidden="true"
          >
            {method.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {ar ? method.name_ar : method.name_en}
              </span>
              {recommended && (
                <span className="inline-flex items-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 text-[10px] font-semibold px-1.5 py-0.5">
                  {ar ? "مُنصَح" : "Rec"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {ar ? method.tagline_ar : method.tagline_en}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${complexityClass}`}>
            {complexityLabel}
          </span>
          <button
            onClick={onToggleExpand}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <span className="text-xs">{expanded ? "▲" : "▼"}</span>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {ar ? method.desc_ar : method.desc_en}
          </p>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {ar ? "الأفضل لـ:" : "Best for:"}{" "}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {(ar ? method.best_for_ar : method.best_for_en).join(" · ")}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-700">
            <div className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {ar ? "مثال:" : "Example:"}
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic">
              {ar ? method.example_ar : method.example_en}
            </p>
          </div>
          <button
            onClick={onSelect}
            className={[
              "w-full py-1.5 rounded-lg text-xs font-semibold transition-all",
              selected
                ? "bg-brand-600 text-white"
                : "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300 hover:bg-brand-100"
            ].join(" ")}
          >
            {selected
              ? (ar ? "✓ تم الاختيار" : "✓ Selected")
              : (ar ? "اختر هذا الأسلوب" : "Use this method")}
          </button>
        </div>
      )}

      {/* Selected checkmark */}
      {selected && !expanded && (
        <div className="mt-2 flex items-center gap-1 text-brand-600 dark:text-brand-400 text-xs font-semibold">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {ar ? "الأسلوب المختار" : "Selected"}
        </div>
      )}
    </div>
  );
}

