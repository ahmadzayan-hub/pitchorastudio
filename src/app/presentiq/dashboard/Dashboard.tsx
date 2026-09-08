"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

type Project = {
  id: string;
  title: string;
  status: string;
  presentation_mode: string;
  language_mode: string;
  created_at: string;
  updated_at: string;
};

const QUALITY_PREVIEW = [
  { label: "Brand Compliance",   value: 100, deltaKey: null },
  { label: "Evidence Integrity", value: 96 },
  { label: "Arabic RTL",         value: 99 },
  { label: "Visual Quality",     value: 98 },
  { label: "Executive Clarity",  value: 92 },
  { label: "Accessibility",      value: 88 },
] as { label: string; value: number }[];

export function Dashboard({ items }: { items: Project[] }) {
  const { t } = useI18n();

  const stats: { label: string; value: string; delta?: string; tone: string }[] = [
    { label: t("dash.kpi.decks"),      value: String(items.length || 0),  delta: t("dash.kpi.decks.delta"), tone: "var(--pq-primary)" },
    { label: t("dash.kpi.compliance"), value: items.length ? "98%" : "—", delta: t("dash.kpi.brand.delta"), tone: "var(--pq-accent-gold)" },
    { label: t("dash.kpi.readiness"),  value: items.length ? "97%" : "—", delta: t("dash.kpi.ready.delta"), tone: "var(--pq-accent-teal)" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "var(--pq-text-main)" }}>
            {t("dash.title")}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--pq-text-secondary)" }}>
            {t("dash.lede")}
          </p>
        </div>
        <Link href="/presentiq/projects/new" className="pq-btn pq-btn-primary">
          ＋ {t("nav.new")}
        </Link>
      </header>

      {/* KPI strip — boardroom-style stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s) => (
          <Frame4D key={s.label} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--pq-text-muted)" }}>
                  {s.label}
                </div>
                <div className="text-3xl font-bold mt-1.5" style={{ color: "var(--pq-text-main)" }}>
                  {s.value}
                </div>
              </div>
              <span
                aria-hidden
                className="mt-1 h-9 w-9 rounded-xl grid place-items-center text-xs font-bold"
                style={{ background: s.tone, color: "var(--pq-primary-text)" }}
              >
                ◆
              </span>
            </div>
            {s.delta && (
              <div className="text-xs mt-3 font-medium" style={{ color: "var(--pq-primary)" }}>
                {s.delta}
              </div>
            )}
          </Frame4D>
        ))}
      </section>

      {/* Quality preview + recent projects */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Frame4D className="p-6 lg:col-span-1" interactive={false}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--pq-text-main)" }}>
                {t("dash.section.quality")}
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--pq-text-secondary)" }}>
                {t("dash.section.quality.lede")}
              </p>
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--pq-primary)" }}>
              97
              <span className="text-[10px] font-medium ms-1" style={{ color: "var(--pq-text-muted)" }}>/100</span>
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            {QUALITY_PREVIEW.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-[11px]" style={{ color: "var(--pq-text-secondary)" }}>
                  <span>{d.label}</span>
                  <span style={{ fontWeight: 600 }}>{d.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: "rgba(159,205,99,0.12)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${d.value}%`,
                      background:
                        d.value >= 90 ? "linear-gradient(90deg,#7BB94A,#9FCD63,#D4F08C)" :
                        d.value >= 75 ? "linear-gradient(90deg,#B8862E,#D5A84A,#F4B63E)" :
                        "linear-gradient(90deg,#F05D6A,#FF8A95)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Frame4D>

        <Frame4D className="p-0 overflow-hidden lg:col-span-2" interactive={false}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--pq-border-soft)" }}>
            <h2 className="text-base font-semibold" style={{ color: "var(--pq-text-main)" }}>
              {t("dash.recent")}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--pq-text-secondary)" }}>
              {t("dash.recent.lede")}
            </p>
          </div>
          <div className="px-6 py-4">
            {items.length === 0 ? (
              <div className="text-sm text-center py-10" style={{ color: "var(--pq-text-secondary)" }}>
                <div className="text-3xl mb-2" aria-hidden style={{ color: "var(--pq-primary)" }}>◆</div>
                <div>{t("dash.empty")}</div>
                <Link
                  href="/presentiq/projects/new"
                  className="pq-btn pq-btn-primary mt-4"
                  style={{ display: "inline-flex" }}
                >
                  {t("dash.empty.cta")} <span className="pq-flip" aria-hidden>→</span>
                </Link>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--pq-border-soft)" }}>
                {items.map((p) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/presentiq/projects/${p.id}`}
                        className="font-medium hover:underline"
                        style={{ color: "var(--pq-text-main)" }}
                      >
                        {p.title}
                      </Link>
                      <div className="text-xs mt-1" style={{ color: "var(--pq-text-muted)" }}>
                        {p.presentation_mode} · {p.language_mode}
                      </div>
                    </div>
                    <span className={`pq-status pq-status-${statusClass(p.status)}`}>{p.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Frame4D>
      </section>
    </div>
  );
}

function statusClass(s: string): "draft" | "ready" | "generating" | "blueprint" {
  if (s === "ready" || s === "approved" || s === "exported") return "ready";
  if (s === "generating" || s === "ingesting") return "generating";
  if (s === "blueprint_ready") return "blueprint";
  return "draft";
}
