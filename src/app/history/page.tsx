"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { safeFetch } from "@/lib/safe-fetch";

interface SessionRow {
  id: string;
  raw_prompt: string;
  intent: string | null;
  status: string;
  target_model: string | null;
  created_at: string;
  updated_at: string;
}

export default function HistoryPage() {
  const t = useT();
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [query, setQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await safeFetch<{ sessions: SessionRow[] }>("/api/sessions");
      if (cancelled) return;
      if (!r.ok || !r.data) {
        // Backend not configured / not signed in → show empty state, not an
        // error. History only makes sense once a backend is wired up.
        const code = r.error?.code;
        if (code === "backend_not_configured" || r.status === 401 || r.status === 403) {
          setRows([]);
        } else {
          setError(r.error ?? { message: "unknown" });
        }
      } else {
        setRows(r.data.sessions ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const intents = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.intent && set.add(r.intent));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (intentFilter !== "all" && r.intent !== intentFilter) return false;
      if (!q) return true;
      return r.raw_prompt.toLowerCase().includes(q);
    });
  }, [rows, query, intentFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-2xl font-semibold">{t("history.title")}</h1>

      <div className="mt-4 flex gap-2 flex-wrap">
        <input
          type="search"
          placeholder={t("history.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)}>
          <option value="all">{t("history.all_intents")}</option>
          {intents.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500 self-center">
          {t("history.count", { shown: filtered.length, total: rows.length })}
        </span>
      </div>

      {loading && <p className="mt-4 text-slate-500">…</p>}
      {error && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">
          <div className="font-medium">{error.message}</div>
          {error.hint && <div className="text-rose-700 text-xs mt-1">{error.hint}</div>}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="card hover:shadow-md transition">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{new Date(s.created_at).toLocaleString()}</span>
              <span>
                {s.intent ?? "—"} · {s.target_model ?? "generic"} · {s.status}
              </span>
            </div>
            <p className="mt-2 text-sm line-clamp-3">{s.raw_prompt}</p>
          </div>
        ))}
        {!loading && filtered.length === 0 && !error && (
          <p className="text-slate-500">
            {rows.length === 0 ? t("history.empty") : t("history.empty_filter")}
          </p>
        )}
      </div>
    </div>
  );
}
