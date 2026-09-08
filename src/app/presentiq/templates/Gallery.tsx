"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { TEMPLATES, type Template } from "@/lib/presentiq/templates/registry";

const FRAMEWORK_ORDER: Template["framework"][] = ["Pyramid", "SCQA", "RACI", "OKR", "PESTEL"];

export function TemplatesGallery() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<Template["framework"] | "all">("all");
  const [openCode, setOpenCode] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? TEMPLATES : TEMPLATES.filter((tp) => tp.framework === filter)),
    [filter],
  );

  return (
    <div className="space-y-6 pq-fade">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-text-main)" }}>
          {t("tpl.title")}
        </h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--pq-text-secondary)" }}>
          {t("tpl.lede")}
        </p>
      </header>

      <div className="pq-tpl-chips" role="tablist" aria-label="Frameworks">
        <button
          type="button"
          className="pq-tpl-chip"
          data-active={filter === "all" ? "true" : "false"}
          onClick={() => setFilter("all")}
        >
          {lang === "ar" ? "الكل" : "All"} · {TEMPLATES.length}
        </button>
        {FRAMEWORK_ORDER.map((f) => {
          const count = TEMPLATES.filter((tp) => tp.framework === f).length;
          if (!count) return null;
          return (
            <button
              key={f}
              type="button"
              className="pq-tpl-chip"
              data-active={filter === f ? "true" : "false"}
              onClick={() => setFilter(f)}
            >
              {f} · {count}
            </button>
          );
        })}
      </div>

      <div className="pq-tpl-grid pq-tpl-grid-detailed">
        {visible.map((tp, i) => (
          <TemplateCard
            key={tp.code}
            template={tp}
            lang={lang}
            t={t}
            isOpen={openCode === tp.code}
            onToggle={() => setOpenCode((cur) => (cur === tp.code ? null : tp.code))}
            riseClass={`pq-rise pq-rise-${Math.min(5, (i % 5) + 1)}`}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template: tp,
  lang,
  t,
  isOpen,
  onToggle,
  riseClass,
}: {
  template: Template;
  lang: "en" | "ar";
  t: (k: any) => string;
  isOpen: boolean;
  onToggle: () => void;
  riseClass: string;
}) {
  const previewSlides = tp.outline.slice(0, 3);

  return (
    <article
      className={`pq-tpl-card ${riseClass}`}
      style={{ aspectRatio: "auto", gridTemplateRows: "auto auto" }}
    >
      <div className="pq-tpl-card-cover" data-tone={tp.tone} style={{ minHeight: 144, padding: "1.25rem 1rem" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              fontWeight: 700,
              opacity: 0.78,
              textTransform: "uppercase",
              marginBottom: "0.4rem",
            }}
          >
            {tp.framework} · {tp.defaultSlides} {lang === "ar" ? "شريحة" : "slides"} · {tp.defaultDurationMin} {lang === "ar" ? "د" : "min"}
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.2 }}>
            {lang === "ar" ? tp.nameAr : tp.nameEn}
          </div>
        </div>
      </div>

      <div className="pq-tpl-card-foot" style={{ padding: "1rem" }}>
        <p
          className="text-sm"
          style={{ color: "var(--pq-text-secondary)", lineHeight: 1.5, minHeight: "2.6rem" }}
        >
          {lang === "ar" ? tp.taglineAr : tp.taglineEn}
        </p>

        <ol
          className="text-xs mt-3"
          style={{ color: "var(--pq-text-muted)", display: "grid", gap: "0.32rem", listStyle: "none", padding: 0 }}
          aria-label={lang === "ar" ? "أبرز الشرائح" : "Outline preview"}
        >
          {previewSlides.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: "1.1rem",
                  height: "1.1rem",
                  borderRadius: 999,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  background: "rgba(99,102,241,0.18)",
                  color: "var(--pq-primary)",
                  flexShrink: 0,
                  marginTop: "0.05rem",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ color: "var(--pq-text-secondary)" }}>
                {lang === "ar" ? s.titleAr : s.titleEn}
              </span>
            </li>
          ))}
          {tp.outline.length > previewSlides.length && (
            <li style={{ paddingInlineStart: "1.5rem" }}>
              + {tp.outline.length - previewSlides.length} {lang === "ar" ? "شريحة أخرى" : "more slides"}
            </li>
          )}
        </ol>

        {isOpen && (
          <details open className="mt-3">
            <summary className="sr-only">Full outline</summary>
            <ol
              className="text-xs"
              style={{
                color: "var(--pq-text-secondary)",
                display: "grid",
                gap: "0.3rem",
                listStyle: "none",
                padding: "0.85rem 1rem",
                margin: "0.5rem 0 0",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--pq-border-soft)",
              }}
            >
              {tp.outline.map((s, i) => (
                <li key={i}>
                  <span style={{ color: "var(--pq-primary)", fontWeight: 600 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  <strong>{lang === "ar" ? s.titleAr : s.titleEn}</strong>
                  <div style={{ color: "var(--pq-text-muted)", marginTop: "0.1rem" }}>
                    {lang === "ar" ? s.purposeAr : s.purposeEn}
                  </div>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Link
            href={`/presentiq/projects/new?template=${tp.code}`}
            className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill"
            style={{ flex: 1, justifyContent: "center", padding: "0.65rem 1rem", fontSize: "0.85rem" }}
          >
            {t("tpl.use")}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="pq-btn pq-btn-liquid pq-btn-liquid-pill"
            style={{ padding: "0.65rem 0.95rem", fontSize: "0.82rem" }}
            aria-expanded={isOpen}
          >
            {isOpen ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "معاينة" : "Preview")}
          </button>
        </div>
      </div>
    </article>
  );
}
