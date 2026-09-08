"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { loadHistory } from "@/lib/local-history";
import type { LocalHistoryEntry } from "@/lib/local-history";
import { scorePrompt } from "@/lib/quality-score";

interface Stats {
  total: number;
  starred: number;
  avgScore: number;
  topIntents: { intent: string; count: number }[];
  topModels: { model: string; count: number }[];
  recentActivity: LocalHistoryEntry[];
  streakDays: number;
  qualityTrend: number[];
}

function computeStats(history: LocalHistoryEntry[]): Stats {
  const intentCounts: Record<string, number> = {};
  const modelCounts: Record<string, number> = {};
  const scores: number[] = [];

  for (const e of history) {
    if (e.intent) intentCounts[e.intent] = (intentCounts[e.intent] ?? 0) + 1;
    if (e.target_model) modelCounts[e.target_model] = (modelCounts[e.target_model] ?? 0) + 1;
    if (e.final_prompt) scores.push(scorePrompt(e.final_prompt).total);
  }

  const topIntents = Object.entries(intentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intent, count]) => ({ intent, count }));

  const topModels = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([model, count]) => ({ model, count }));

  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Streak: how many consecutive days have entries?
  const days = [...new Set(history.map((e) => new Date(e.ts).toDateString()))];
  let streakDays = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.includes(d.toDateString())) streakDays++;
    else break;
  }

  // Quality trend: last 10 prompts' scores
  const qualityTrend = history
    .slice(0, 10)
    .map((e) => (e.final_prompt ? scorePrompt(e.final_prompt).total : 0))
    .reverse();

  return {
    total: history.length,
    starred: history.filter((e) => e.bookmarked).length,
    avgScore,
    topIntents,
    topModels,
    recentActivity: history.slice(0, 6),
    streakDays,
    qualityTrend,
  };
}

const INTENT_EMOJI: Record<string, string> = {
  coding: "💻", writing: "✍️", research: "🔍", analysis: "📊",
  planning: "📋", creative: "🎨", design: "🖌️", report: "📄",
  software: "🖥️", website: "🌐", image: "🖼️", video: "🎬", other: "✨",
};
const MODEL_EMOJI: Record<string, string> = {
  chatgpt: "🟢", claude: "🟠", gemini: "🔵", copilot: "🟣", generic: "⚪",
};

export default function DashboardPage() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const [history, setHistory] = useState<LocalHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const stats = useMemo(() => history.length ? computeStats(history) : null, [history]);

  if (!stats) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">{ar ? "جارٍ التحميل…" : "Loading…"}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl" aria-hidden="true">📊</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {ar ? "لوحة التحكم" : "Dashboard"}
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {ar ? "نشاطك في كتابة الموجّهات — كل شيء محلي وخاص" : "Your prompt engineering activity — fully local and private"}
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <KPICard
            emoji="📝"
            label={ar ? "إجمالي الموجّهات" : "Total Prompts"}
            value={stats.total}
            color="text-brand-600 dark:text-brand-400"
            bg="from-brand-50 to-violet-50 dark:from-brand-950/40 dark:to-violet-950/30"
          />
          <KPICard
            emoji="⭐"
            label={ar ? "الموجّهات المنجّمة" : "Starred Prompts"}
            value={stats.starred}
            color="text-amber-600 dark:text-amber-400"
            bg="from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20"
          />
          <KPICard
            emoji="🏆"
            label={ar ? "متوسط جودة الموجّه" : "Avg Prompt Quality"}
            value={`${stats.avgScore}/100`}
            color={stats.avgScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : stats.avgScore >= 45 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}
            bg="from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20"
          />
          <KPICard
            emoji="🔥"
            label={ar ? "أيام متتالية" : "Day Streak"}
            value={stats.streakDays}
            color="text-rose-600 dark:text-rose-400"
            bg="from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/20"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left col: intents + models */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quality trend sparkline */}
            {stats.qualityTrend.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                    {ar ? "اتجاه جودة الموجّهات" : "Prompt Quality Trend"}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {ar ? "آخر 10 موجّهات" : "Last 10 prompts"}
                  </span>
                </div>
                <Sparkline data={stats.qualityTrend} />
              </div>
            )}

            {/* Top intents */}
            {stats.topIntents.length > 0 && (
              <div className="card p-5">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
                  {ar ? "الأنواع الأكثر استخدامًا" : "Most Used Intent Types"}
                </h2>
                <div className="space-y-3">
                  {stats.topIntents.map(({ intent, count }) => {
                    const pct = Math.round((count / stats.total) * 100);
                    return (
                      <div key={intent}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                            <span>{INTENT_EMOJI[intent] ?? "✨"}</span>
                            <span className="capitalize">{intent}</span>
                          </span>
                          <span className="text-slate-400">{count} ({pct}%)</span>
                        </div>
                        <div className="quality-bar-track">
                          <div className="quality-bar-fill bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top models */}
            {stats.topModels.length > 0 && (
              <div className="card p-5">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
                  {ar ? "النماذج الأكثر استخدامًا" : "Most Used AI Models"}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {stats.topModels.map(({ model, count }) => (
                    <div key={model} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 flex items-center gap-2.5">
                      <span className="text-xl">{MODEL_EMOJI[model] ?? "⚪"}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white capitalize">{model}</div>
                        <div className="text-xs text-slate-400">{count} {ar ? "موجّه" : "prompt"}{count !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right col: recent activity */}
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                  {ar ? "النشاط الأخير" : "Recent Activity"}
                </h2>
                <a href="/library" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  {ar ? "عرض الكل" : "View all"}
                </a>
              </div>
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2" aria-hidden="true">📭</div>
                  <p className="text-xs text-slate-400">
                    {ar ? "لا يوجد نشاط بعد" : "No activity yet"}
                  </p>
                  <a href="/workspace" className="mt-3 inline-block btn-primary text-xs py-1.5 px-3">
                    {ar ? "ابدأ الآن" : "Get Started"}
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.recentActivity.map((e) => (
                    <div key={e.id} className="flex items-start gap-2.5 py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <span className="text-base mt-0.5">{INTENT_EMOJI[e.intent ?? "other"] ?? "✨"}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-700 dark:text-slate-200 truncate font-medium">
                          {e.raw.slice(0, 60)}{e.raw.length > 60 ? "…" : ""}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">
                            {new Date(e.ts).toLocaleDateString(ar ? "ar-AE" : "en-GB", { day: "2-digit", month: "short" })}
                          </span>
                          {e.bookmarked && <span className="text-[10px] text-amber-500">⭐</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="card p-5">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
                {ar ? "إجراءات سريعة" : "Quick Actions"}
              </h2>
              <div className="space-y-2">
                {[
                  { href: "/workspace", emoji: "✏️", label_en: "New Prompt", label_ar: "موجِّه جديد", color: "bg-brand-600" },
                  { href: "/library", emoji: "📚", label_en: "My Library", label_ar: "مكتبتي", color: "bg-violet-600" },
                  { href: "/templates", emoji: "📋", label_en: "Templates", label_ar: "القوالب", color: "bg-emerald-600" },
                  { href: "/learn", emoji: "🎓", label_en: "Learn", label_ar: "تعلّم", color: "bg-amber-600" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group"
                  >
                    <span className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white text-sm`}>
                      {item.emoji}
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {ar ? item.label_ar : item.label_en}
                    </span>
                    <span className="ms-auto text-slate-300 dark:text-slate-600 group-hover:text-brand-400 transition-colors">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function KPICard({ emoji, label, value, color, bg }: {
  emoji: string; label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <div className={`card p-5 bg-gradient-to-br ${bg}`}>
      <div className="text-2xl mb-2" aria-hidden="true">{emoji}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 400; const H = 60; const pad = 8;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (W - pad * 2);
        const y = H - pad - ((v / max) * (H - pad * 2));
        return (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
        );
      })}
    </svg>
  );
}
