"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";
import { Button } from "@/components/presentiq/ui/Button";
import { Badge } from "@/components/presentiq/ui/Badge";
import { QualityPanel } from "@/components/presentiq/QualityPanel";

type Slide = {
  id: string;
  slide_number: number;
  title_en?: string;
  title_ar?: string;
  key_message_en?: string;
  key_message_ar?: string;
  speaker_notes_en?: string;
  speaker_notes_ar?: string;
  content_json: any;
  status: string;
};

// AI actions exposed in the right-hand panel. The `instruction` string is
// what the regenerate-slide endpoint matches against (both demo + Supabase
// orchestrators). `label` is what we show on the button + in the success
// pill, `icon` is a short visual marker.
const ACTIONS: { instruction: string; label: string; icon: string }[] = [
  { instruction: "Regenerate this slide.",                                  label: "Regenerate",          icon: "↻" },
  { instruction: "Simplify the slide. One idea, max 5 bullets.",            label: "Simplify",            icon: "≡" },
  { instruction: "Make it more executive. Statement-style title, fewer words.", label: "Make executive",  icon: "◆" },
  { instruction: "Make it more visual. Replace text with a chart or diagram.",  label: "Make visual",     icon: "▦" },
  { instruction: "Translate to Arabic and add the Arabic version.",         label: "Translate to Arabic", icon: "ع" },
  { instruction: "Convert to bilingual: keep EN, add formal corporate AR.", label: "Convert bilingual",   icon: "⇄" },
  { instruction: "Add executive speaker notes in EN and AR.",               label: "Add speaker notes",   icon: "✎" },
];

export function Editor({ projectId, initialSlides, title }: { projectId: string; initialSlides: Slide[]; title: string }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [activeId, setActiveId] = useState<string | null>(initialSlides[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<any>(null);
  // Most-recently-applied action label, shown as a transient "✓ Updated" pill
  // next to the Actions panel so the user gets a clear success signal even
  // when the change is subtle (e.g. a small key-message tweak).
  const [lastApplied, setLastApplied] = useState<string | null>(null);

  const active = useMemo(() => slides.find((s) => s.id === activeId) ?? null, [slides, activeId]);

  async function readJsonOrText(res: Response): Promise<any> {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); }
    catch { return { error: { message: text.slice(0, 240) || `${res.status} ${res.statusText}` } }; }
  }

  async function regen(instruction: string, label?: string) {
    if (!active) return;
    setBusy(instruction); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${projectId}/regenerate-slide/${active.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await readJsonOrText(res);
      if (!res.ok) throw new Error(data?.error?.message ?? `failed (${res.status})`);
      if (!data?.slide) throw new Error("response missing slide payload");
      setSlides((prev) => prev.map((s) => (s.id === active.id ? { ...s, ...data.slide } : s)));
      if (label) {
        setLastApplied(label);
        setTimeout(() => setLastApplied((cur) => (cur === label ? null : cur)), 2400);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function checkQuality() {
    setBusy("quality"); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${projectId}/quality`, { method: "POST" });
      const data = await readJsonOrText(res);
      if (!res.ok) throw new Error(data?.error?.message ?? `failed (${res.status})`);
      if (!data?.report) throw new Error("response missing report payload");
      setQuality(data.report);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function exportPptx() {
    setBusy("pptx"); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${projectId}/export-pptx`, { method: "POST" });
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.error?.message ?? `export failed (${res.status})`);
      }
      if (ct.includes("application/json")) {
        const data = await res.json();
        if (data.url) window.open(data.url, "_blank");
        else throw new Error("export response missing url");
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const filename = (title || "presentation").replace(/[^\w؀-ۿ\-]+/g, "_") + ".pptx";
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 min-h-[70vh]">
      {/* Storyboard */}
      <aside className="col-span-12 lg:col-span-3">
        <Card>
          <CardHeader title="Storyboard" subtitle={`${slides.length} slides`} />
          <CardBody className="space-y-1 max-h-[70vh] overflow-y-auto p-2">
            {slides.map((s) => {
              const isActive = activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors"
                  style={{
                    border: `1px solid ${isActive ? "var(--pq-primary)" : "transparent"}`,
                    background: isActive ? "rgba(159,205,99,0.10)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,247,239,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <div className="text-xs" style={{ color: "var(--pq-text-muted)" }}>Slide {s.slide_number}</div>
                  <div className="text-sm font-medium truncate" style={{ color: "var(--pq-text-main)" }}>{s.title_en ?? "Untitled"}</div>
                  {s.title_ar && <div className="text-xs truncate" dir="rtl" style={{ color: "var(--pq-text-secondary)" }}>{s.title_ar}</div>}
                  <Badge tone={s.status === "approved" ? "green" : s.status === "locked" ? "navy" : "zinc"}>{s.status}</Badge>
                </button>
              );
            })}
          </CardBody>
        </Card>
      </aside>

      {/* Preview */}
      <section className="col-span-12 lg:col-span-6">
        <Card>
          <CardHeader title={active ? `Slide ${active.slide_number}` : title} action={
            <div className="flex gap-2">
              <Button variant="liquid" onClick={checkQuality} disabled={busy !== null}>
                {busy === "quality" ? <><span className="pq-spinner" aria-hidden /> Running…</> : "Run quality"}
              </Button>
              <Button variant="liquid-primary" onClick={exportPptx} disabled={busy !== null}>
                {busy === "pptx" ? <><span className="pq-spinner" aria-hidden /> Exporting…</> : "Export PPTX"}
              </Button>
            </div>
          } />
          <CardBody>
            {error && (
              <div className="pq-alert mb-4">{error}</div>
            )}
            {!active ? (
              <div className="text-sm" style={{ color: "var(--pq-text-secondary)" }}>Select a slide.</div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--pq-text-main)" }}>{active.title_en ?? "Untitled"}</h2>
                {active.title_ar && (<h3 className="text-xl" dir="rtl" style={{ color: "var(--pq-text-secondary)" }}>{active.title_ar}</h3>)}
                {active.key_message_en && <p style={{ color: "var(--pq-text-secondary)" }}>{active.key_message_en}</p>}
                {active.key_message_ar && <p dir="rtl" style={{ color: "var(--pq-text-secondary)" }}>{active.key_message_ar}</p>}
                <SlideContent model={active.content_json} />
                {(active.speaker_notes_en || active.speaker_notes_ar) && (
                  <div
                    className="mt-6 rounded-xl p-4"
                    style={{
                      border: "1px solid var(--pq-border-soft)",
                      background: "rgba(7,16,10,0.6)",
                    }}
                  >
                    <div className="text-xs uppercase mb-1" style={{ color: "var(--pq-text-muted)" }}>Speaker notes</div>
                    {active.speaker_notes_en && <p className="text-sm" style={{ color: "var(--pq-text-secondary)" }}>{active.speaker_notes_en}</p>}
                    {active.speaker_notes_ar && <p className="text-sm mt-2" dir="rtl" style={{ color: "var(--pq-text-secondary)" }}>{active.speaker_notes_ar}</p>}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Actions panel — liquid (frosted-glass) capsules for AI tweaks */}
      <aside className="col-span-12 lg:col-span-3 space-y-4">
        <Card>
          <CardHeader
            title="Actions"
            subtitle={lastApplied ? `✓ ${lastApplied}` : undefined}
          />
          <CardBody className="grid grid-cols-1 gap-2.5">
            {ACTIONS.map((a) => {
              const isBusy = busy === a.instruction;
              return (
                <Button
                  key={a.instruction}
                  variant="liquid"
                  disabled={!active || busy !== null}
                  onClick={() => regen(a.instruction, a.label)}
                  aria-busy={isBusy ? "true" : "false"}
                  style={{ padding: "0.7rem 1rem", fontSize: "0.88rem", justifyContent: "center" }}
                >
                  {isBusy ? (
                    <>
                      <span className="pq-spinner" aria-hidden /> Working…
                    </>
                  ) : (
                    <>
                      <span aria-hidden style={{ opacity: 0.85 }}>{a.icon}</span> {a.label}
                    </>
                  )}
                </Button>
              );
            })}
          </CardBody>
        </Card>
        {quality && <QualityPanel report={quality} />}
      </aside>
    </div>
  );
}

function SlideContent({ model }: { model: any }) {
  if (!model) return null;
  const SURFACE = "rgba(7,16,10,0.55)";
  const BORDER  = "var(--pq-border-soft)";
  const TEXT    = "var(--pq-text-main)";
  const TEXT2   = "var(--pq-text-secondary)";
  const MUTED   = "var(--pq-text-muted)";

  switch (model.kind) {
    case "cover":
      return (
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #0F1F12 0%, #18281D 60%, #1F3324 130%)",
            color: "var(--pq-text-main)",
            border: "1px solid rgba(159,205,99,0.32)",
            minHeight: 220,
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--pq-primary)" }}>
            {model.subtitle ? "Cover" : "Title"}
          </div>
          <div className="mt-2 text-3xl font-bold leading-tight">{model.title}</div>
          {model.subtitle && <div className="mt-3 text-sm max-w-prose" style={{ color: TEXT2 }}>{model.subtitle}</div>}
          {model.date && <div className="mt-4 text-xs" style={{ color: MUTED }}>{model.date}</div>}
        </div>
      );
    case "bullets":
    case "exec_summary":
      return (
        <ol className="space-y-2.5">{(model.bullets ?? []).map((b: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 grid place-items-center w-6 h-6 rounded-full text-xs font-semibold shrink-0"
              style={{ background: "var(--pq-primary)", color: "var(--pq-primary-text)" }}
            >{i + 1}</span>
            <span style={{ color: TEXT }}>{b}</span>
          </li>
        ))}</ol>
      );
    case "decision":
      return (
        <div>
          <div className="rounded-xl p-4" style={{ background: "var(--pq-primary)", color: "var(--pq-primary-text)" }}>
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">Recommendation</div>
            <p className="text-lg font-semibold mt-1">{model.recommendation}</p>
          </div>
          <ol className="mt-4 space-y-2">{(model.rationale ?? []).map((b: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 grid place-items-center w-5 h-5 rounded-full text-[10px] font-semibold shrink-0"
                style={{ background: "var(--pq-accent-gold)", color: "#1A1305" }}
              >{i + 1}</span>
              <span className="text-sm" style={{ color: TEXT }}>{b}</span>
            </li>
          ))}</ol>
        </div>
      );
    case "kpi":
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{(model.cards ?? []).map((c: any, i: number) => (
          <div key={i} className="relative rounded-xl p-4 overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "var(--pq-primary)" }} />
            <div className="text-[10px] font-semibold tracking-widest uppercase mt-1" style={{ color: MUTED }}>{c.label}</div>
            <div className="text-3xl font-bold mt-1" style={{ color: "var(--pq-primary)" }}>{c.value}</div>
            {c.delta && (
              <div
                className="text-xs mt-1.5 font-medium"
                style={{ color: c.delta.startsWith("-") ? "var(--pq-accent-red)" : "var(--pq-accent-gold)" }}
              >{c.delta}</div>
            )}
          </div>
        ))}</div>
      );
    case "timeline":
      return (
        <div className="relative pt-8 pb-2">
          <div className="absolute left-2 right-2 top-12 h-0.5" style={{ background: "rgba(159,205,99,0.45)" }} />
          <div className="grid" style={{ gridTemplateColumns: `repeat(${(model.milestones ?? []).length || 1}, 1fr)` }}>
            {(model.milestones ?? []).map((m: any, i: number) => (
              <div key={i} className="text-center px-2 relative">
                <div
                  className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: "var(--pq-primary)", color: "var(--pq-primary-text)" }}
                >{m.date}</div>
                <div
                  className="mx-auto mt-2 w-3 h-3 rounded-full"
                  style={{ background: "var(--pq-accent-gold)", boxShadow: "0 0 0 2px #07100A" }}
                />
                <div className="mt-2 text-xs leading-snug" style={{ color: TEXT }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "matrix":
      return (
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead><tr>
            <th className="px-2 py-1" style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }} />
            {(model.cols ?? []).map((c: string) => (
              <th
                key={c}
                className="text-left px-2 py-1 text-xs font-semibold"
                style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, color: "var(--pq-primary)" }}
              >{c}</th>
            ))}
          </tr></thead>
          <tbody>{(model.rows ?? []).map((r: string, i: number) => (
            <tr key={r}>
              <td className="px-2 py-1 font-medium text-xs" style={{ background: SURFACE, color: TEXT }}>{r}</td>
              {(model.cells?.[i] ?? []).map((cell: string, j: number) => (
                <td key={j} className="px-2 py-1 text-xs" style={{ borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{cell}</td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      );
    case "stakeholder_map":
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-[16/8]">
          {[
            { key: "high_high", label: "High influence · High interest", color: "var(--pq-primary)",     fg: "var(--pq-primary-text)" },
            { key: "high_low",  label: "High influence · Low interest",  color: "var(--pq-accent-gold)", fg: "#1A1305" },
            { key: "low_high",  label: "Low influence · High interest",  color: "var(--pq-accent-teal)", fg: "#062420" },
            { key: "low_low",   label: "Low influence · Low interest",    color: "rgba(159,205,99,0.20)", fg: TEXT },
          ].map((q) => (
            <div key={q.key} className="rounded-xl p-3" style={{ background: q.color, color: q.fg }}>
              <div className="text-[10px] uppercase tracking-widest opacity-80">{q.label}</div>
              <ul className="mt-1.5 text-xs list-disc list-inside opacity-95">
                {(model.quadrants?.[q.key] ?? []).map((n: string, i: number) => (<li key={i}>{n}</li>))}
              </ul>
            </div>
          ))}
        </div>
      );
    case "next_steps":
      return (
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead><tr className="text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
            <th className="text-left py-1.5 pl-1" style={{ borderBottom: `1px solid ${BORDER}` }}>Action</th>
            <th className="text-left py-1.5"     style={{ borderBottom: `1px solid ${BORDER}` }}>Owner</th>
            <th className="text-left py-1.5"     style={{ borderBottom: `1px solid ${BORDER}` }}>Due</th>
          </tr></thead>
          <tbody>{(model.actions ?? []).map((a: any, i: number) => (
            <tr key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
              <td className="py-2 pl-1" style={{ color: TEXT }}>{a.action}</td>
              <td className="py-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: "rgba(159,205,99,0.14)", color: "var(--pq-primary)", border: "1px solid rgba(159,205,99,0.32)" }}
                >{a.owner}</span>
              </td>
              <td className="py-2" style={{ color: TEXT2 }}>{a.due}</td>
            </tr>
          ))}</tbody>
        </table>
      );
    case "table":
      return (
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead><tr>{(model.headers ?? []).map((h: string) => (
            <th key={h} className="text-left px-2 py-1.5 text-xs" style={{ background: "var(--pq-primary)", color: "var(--pq-primary-text)" }}>{h}</th>
          ))}</tr></thead>
          <tbody>{(model.rows ?? []).map((r: string[], i: number) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(159,205,99,0.06)" }}>
              {r.map((c, j) => (
                <td key={j} className="px-2 py-1.5" style={{ borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{c}</td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      );
    case "chart":
      return (
        <div className="rounded-xl p-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="text-xs font-semibold mb-2" style={{ color: TEXT }}>{model.spec?.title ?? "Chart"}</div>
          <div className="text-xs" style={{ color: MUTED }}>
            {model.spec?.kind ?? "column"} · {(model.spec?.categories ?? []).length} categories · {(model.spec?.series ?? []).length} series
          </div>
          <div className="mt-3 grid grid-flow-col auto-cols-fr items-end gap-2 h-32">
            {(model.spec?.categories ?? []).map((cat: string, i: number) => {
              const max = Math.max(...((model.spec?.series ?? []).flatMap((s: any) => s.values ?? [0])).map(Math.abs));
              return (
                <div key={cat} className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5 items-end h-24">
                    {(model.spec?.series ?? []).map((s: any, j: number) => {
                      const v = Math.abs(s.values?.[i] ?? 0);
                      const h = max > 0 ? (v / max) * 100 : 0;
                      const colors = ["var(--pq-primary)", "var(--pq-accent-gold)", "var(--pq-accent-teal)"];
                      return <div key={j} className="w-3 rounded-t" style={{ height: `${h}%`, background: colors[j % 3] }} />;
                    })}
                  </div>
                  <div className="text-[10px]" style={{ color: MUTED }}>{cat}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    default:
      return (
        <pre
          className="p-3 rounded text-xs overflow-x-auto"
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT2 }}
        >
          {JSON.stringify(model, null, 2)}
        </pre>
      );
  }
}
