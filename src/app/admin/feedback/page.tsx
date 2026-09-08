"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { safeFetch } from "@/lib/safe-fetch";

interface RecentRow {
  rating: number;
  intent: string | null;
  target_model: string | null;
  locale: string | null;
  comment: string | null;
  created_at: string;
}

interface AdminFeedback {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  pct_positive: number;
  by_intent: Record<string, { up: number; down: number }>;
  by_model: Record<string, { up: number; down: number }>;
  by_locale: Record<string, number>;
  top_tags: Array<{ tag: string; count: number }>;
  recent: RecentRow[];
}

export const dynamic = "force-dynamic";

export default function AdminFeedbackPage() {
  const t = useT();
  const [data, setData] = useState<AdminFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await safeFetch<AdminFeedback>("/api/admin/feedback");
      if (cancelled) return;
      if (!r.ok || !r.data) {
        const code = r.error?.code;
        if (code === "backend_not_configured") {
          setError(t("admin.no_backend"));
        } else if (r.status === 401 || r.status === 403) {
          setError(t("admin.forbidden"));
        } else {
          setError(r.error?.message ?? t("admin.unknown_error"));
        }
      } else {
        setData(r.data);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [t]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="card animate-pulse h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="card">
          <h1 className="text-xl font-semibold">{t("admin.title")}</h1>
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <p className="mt-2 text-xs text-slate-500">{t("admin.rls_note")}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("admin.subtitle", { n: data.total })}</p>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label={t("admin.kpi.total")}     value={data.total}    tone="brand" />
        <Kpi label={t("admin.kpi.positive")}  value={data.positive} tone="emerald" sub={`${data.pct_positive}%`} />
        <Kpi label={t("admin.kpi.negative")}  value={data.negative} tone="rose" />
        <Kpi label={t("admin.kpi.neutral")}   value={data.neutral}  tone="slate" />
      </div>

      <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
        <Bars title={t("admin.by_intent")} rows={data.by_intent} />
        <Bars title={t("admin.by_model")}  rows={data.by_model} />
      </div>

      <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold mb-3">{t("admin.top_tags")}</h2>
          {data.top_tags.length === 0 ? (
            <p className="text-xs text-slate-500">{t("admin.no_tags")}</p>
          ) : (
            <ul className="space-y-1.5">
              {data.top_tags.map((t) => (
                <li key={t.tag} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{t.tag}</span>
                  <span className="text-xs text-slate-500 tabular-nums">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold mb-3">{t("admin.by_locale")}</h2>
          <ul className="space-y-1.5">
            {Object.entries(data.by_locale).map(([loc, n]) => (
              <li key={loc} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate">{loc}</span>
                <span className="text-xs text-slate-500 tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold mb-3">{t("admin.recent")}</h2>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-500 text-start">
              <tr>
                <th className="text-start py-1.5 pe-2">{t("admin.col.when")}</th>
                <th className="text-start py-1.5 pe-2">{t("admin.col.rating")}</th>
                <th className="text-start py-1.5 pe-2">{t("admin.col.intent")}</th>
                <th className="text-start py-1.5 pe-2">{t("admin.col.model")}</th>
                <th className="text-start py-1.5 pe-2">{t("admin.col.locale")}</th>
                <th className="text-start py-1.5 pe-2">{t("admin.col.note")}</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((r, i) => (
                <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-1.5 pe-2 text-slate-500 tabular-nums">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-1.5 pe-2">{r.rating > 0 ? "👍" : r.rating < 0 ? "👎" : "·"}</td>
                  <td className="py-1.5 pe-2">{r.intent ?? "—"}</td>
                  <td className="py-1.5 pe-2">{r.target_model ?? "—"}</td>
                  <td className="py-1.5 pe-2">{r.locale ?? "—"}</td>
                  <td className="py-1.5 pe-2 text-slate-700 dark:text-slate-300 max-w-md truncate">{r.comment ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label, value, tone, sub
}: {
  label: string; value: number; tone: "brand" | "emerald" | "rose" | "slate"; sub?: string;
}) {
  const cls: Record<string, string> = {
    brand:   "text-brand-700 dark:text-brand-300",
    emerald: "text-emerald-700 dark:text-emerald-400",
    rose:    "text-rose-700 dark:text-rose-400",
    slate:   "text-slate-700 dark:text-slate-300"
  };
  return (
    <div className="card">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={"mt-1 text-2xl font-bold tabular-nums " + cls[tone]}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Bars({ title, rows }: {
  title: string;
  rows: Record<string, { up: number; down: number }>;
}) {
  const entries = Object.entries(rows).sort((a, b) =>
    (b[1].up + b[1].down) - (a[1].up + a[1].down)
  );
  const max = Math.max(1, ...entries.map(([, v]) => v.up + v.down));

  return (
    <div className="card">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-xs text-slate-500">—</p>
      ) : (
        <ul className="space-y-2">
          {entries.map(([k, v]) => {
            const total = v.up + v.down;
            const upPct = total ? (v.up / total) * 100 : 0;
            const widthPct = (total / max) * 100;
            return (
              <li key={k} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate font-medium">{k}</span>
                  <span className="text-slate-500 tabular-nums">{v.up} 👍 · {v.down} 👎</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${widthPct}%`,
                      background: `linear-gradient(to right, #10b981 ${upPct}%, #f43f5e ${upPct}%)`
                    }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
