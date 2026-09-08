"use client";

import { useMemo } from "react";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";

type Dim = { label: string; value: number; invert?: boolean };

export function QualityPanel({ report }: { report: any }) {
  if (!report) return null;
  const scores = report.scores ?? {};

  const dims: Dim[] = [
    { label: "Brand Compliance",    value: scores.brand_compliance },
    { label: "Evidence Integrity",  value: scores.evidence_integrity },
    { label: "Arabic RTL",          value: scores.rtl },
    { label: "Slide Simplicity",    value: scores.slide_simplicity },
    { label: "Visual Quality",      value: scores.visual_quality },
    { label: "Executive Clarity",   value: scores.executive_clarity },
    { label: "Accessibility",       value: scores.accessibility },
    { label: "Hallucination Risk",  value: scores.hallucination_risk, invert: true },
    { label: "Template Compliance", value: scores.template_compliance },
    { label: "Readiness",           value: scores.boardroom_readiness },
  ];

  const readiness = Math.round(scores.boardroom_readiness ?? 0);
  const readinessLabel =
    readiness >= 95 ? "Boardroom-ready" :
    readiness >= 80 ? "Almost ready"     :
    readiness >= 60 ? "Needs revision"   :
                      "Not ready";
  const ringColor =
    readiness >= 95 ? "var(--pq-primary)" :
    readiness >= 80 ? "var(--pq-accent-amber)" :
                      "var(--pq-accent-red)";

  return (
    <Card>
      <CardHeader title="Quality" subtitle="10-dimension radar" />
      <CardBody>
        {/* Readiness summary */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="grid place-items-center rounded-full shrink-0"
            style={{
              width: 84,
              height: 84,
              background: `conic-gradient(${ringColor} ${readiness * 3.6}deg, rgba(99,102,241,0.10) 0)`,
            }}
            aria-hidden
          >
            <div
              className="grid place-items-center rounded-full"
              style={{ width: 64, height: 64, background: "var(--pq-bg-secondary)" }}
            >
              <div className="text-2xl font-bold" style={{ color: ringColor }}>{readiness}</div>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--pq-text-muted)" }}>
              Boardroom Readiness
            </div>
            <div className="text-base font-semibold mt-0.5" style={{ color: ringColor }}>
              {readinessLabel}
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <RadarChart dims={dims} />

        {/* Per-dimension bars (collapsible-feel; always visible, compact) */}
        <details className="mt-4" open={false}>
          <summary
            className="text-xs cursor-pointer select-none"
            style={{ color: "var(--pq-text-muted)" }}
          >
            See per-dimension breakdown
          </summary>
          <div className="mt-3 space-y-2">
            {dims.slice(0, 9).map((d) => (
              <Row key={d.label} label={d.label} value={d.value ?? 0} invert={d.invert} />
            ))}
          </div>
        </details>

        {report.recommendations?.length ? (
          <div
            className="mt-4 rounded-lg p-3 text-sm"
            style={{
              background: "rgba(233,75,159,0.10)",
              border: "1px solid rgba(233,75,159,0.30)",
              color: "var(--pq-accent-magenta)",
            }}
          >
            <div className="font-semibold mb-1">Recommendations</div>
            <ul className="list-disc list-inside space-y-1">
              {report.recommendations.slice(0, 4).map((r: any, i: number) => (
                <li key={i}>{r.action}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div
            className="mt-4 rounded-lg p-3 text-sm"
            style={{
              background: "rgba(99,102,241,0.10)",
              border: "1px solid rgba(99,102,241,0.30)",
              color: "var(--pq-primary)",
            }}
          >
            <div className="font-semibold mb-0.5">All clear ✓</div>
            <div className="text-xs" style={{ color: "var(--pq-text-secondary)" }}>
              Deck meets every boardroom rule. Ready to export.
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ── 10-dimension radar chart ──────────────────────────────────────
   Pure SVG, no chart-lib dependency. Each spoke = one quality
   dimension; the polygon area visualises the deck's profile. */
function RadarChart({ dims }: { dims: Dim[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const n = dims.length;

  const normalised = useMemo(
    () =>
      dims.map((d) => {
        const raw = Number.isFinite(d.value) ? d.value : 0;
        const v = d.invert ? Math.max(0, 100 - raw) : raw;
        return Math.max(0, Math.min(100, v));
      }),
    [dims],
  );

  // Spoke i sits at angle -π/2 + (i / n) * 2π so spoke 0 points up.
  const angle = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const point = (i: number, radius: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius] as const;
  };

  const polygon = normalised
    .map((v, i) => {
      const [x, y] = point(i, (v / 100) * r);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const rings = [0.25, 0.5, 0.75, 1].map((k) =>
    Array.from({ length: n }, (_, i) => {
      const [x, y] = point(i, r * k);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" "),
  );

  return (
    <div className="relative" style={{ display: "grid", placeItems: "center" }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="auto"
        style={{ maxWidth: 320, overflow: "visible" }}
        role="img"
        aria-label="10-dimension quality radar"
      >
        <defs>
          <radialGradient id="pq-radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(99,102,241,0.55)" />
            <stop offset="60%"  stopColor="rgba(138,108,247,0.30)" />
            <stop offset="100%" stopColor="rgba(77,201,230,0.18)" />
          </radialGradient>
        </defs>

        {/* Concentric grid rings */}
        {rings.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="rgba(199,204,236,0.12)"
            strokeWidth={i === rings.length - 1 ? 1 : 0.7}
          />
        ))}

        {/* Spokes */}
        {dims.map((_, i) => {
          const [x, y] = point(i, r);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(199,204,236,0.12)"
              strokeWidth={0.7}
            />
          );
        })}

        {/* Score polygon */}
        <polygon
          points={polygon}
          fill="url(#pq-radar-fill)"
          stroke="var(--pq-primary)"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {normalised.map((v, i) => {
          const [x, y] = point(i, (v / 100) * r);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2.6}
              fill="var(--pq-primary)"
              stroke="var(--pq-bg-main)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis labels */}
        {dims.map((d, i) => {
          const [x, y] = point(i, r + 14);
          const a = angle(i);
          const anchor =
            Math.abs(Math.cos(a)) < 0.2 ? "middle" :
            Math.cos(a) > 0 ? "start" : "end";
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize={8.5}
              fontWeight={600}
              fill="var(--pq-text-secondary)"
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Row({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const v = Math.round(value);
  const display = invert ? Math.max(0, 100 - v) : v;
  const tone =
    display >= 90 ? "linear-gradient(90deg,#4F46E5,#6366F1,#8A6CF7)" :
    display >= 75 ? "linear-gradient(90deg,#FFC36B,#F4B63E)" :
                    "linear-gradient(90deg,#E94B9F,#F0556B)";
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--pq-text-secondary)" }}>{label}</span>
        <span className="font-semibold" style={{ color: "var(--pq-text-main)" }}>{display}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.10)" }}>
        <div className="h-full" style={{ width: `${display}%`, background: tone }} />
      </div>
    </div>
  );
}
