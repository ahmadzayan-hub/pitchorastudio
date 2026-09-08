/**
 * Quality scoring engine — 10 dimensions.
 *
 * Each dimension returns 0..100. The Boardroom Readiness score is
 * a weighted aggregation of the others.
 */

import type { BrandRulesContext, EvidenceItem, Slide, QualityReport } from "../types";
import { validatePalette, validateLayoutDensity, validateText } from "../brand/governance";
import { validateSlideRtl } from "../rtl/validate";
import { scanForFakeApproval } from "../security/guardrail";

type Inputs = {
  slides: Slide[];
  ctx: BrandRulesContext;
  evidence: EvidenceItem[];
  templateCompliance?: number; // 0..100; pass-through from renderer
};

export function scoreDeck(input: Inputs): QualityReport {
  const findings: QualityReport["findings"] = [];
  const recommendations: QualityReport["recommendations"] = [];

  const brand = brandCompliance(input, findings);
  const evidence = evidenceIntegrity(input, findings);
  const rtl = rtlScore(input, findings);
  const simplicity = slideSimplicity(input, findings);
  const visual = visualQuality(input, findings);
  const exec = executiveClarity(input, findings);
  const a11y = accessibility(input, findings);
  const halluc = hallucinationRisk(input, findings);
  const tmpl = input.templateCompliance ?? 100;

  // Boardroom readiness — weighted aggregation
  const readiness =
    0.20 * brand +
    0.20 * evidence +
    0.10 * rtl +
    0.10 * simplicity +
    0.10 * visual +
    0.10 * exec +
    0.05 * a11y +
    0.10 * (100 - halluc) +
    0.05 * tmpl;

  if (brand < 80) recommendations.push({ dimension: "brand_compliance", action: "Re-run Brand Governance and tighten palette + terminology." });
  if (evidence < 80) recommendations.push({ dimension: "evidence_integrity", action: "Mark unverifiable claims as [Input Required]." });
  if (rtl < 90 && input.ctx.language.rtl_required) recommendations.push({ dimension: "rtl", action: "Run the RTL agent and replace ASCII punctuation." });
  if (simplicity < 70) recommendations.push({ dimension: "slide_simplicity", action: "Reduce words per slide. Use one idea per surface." });
  if (halluc > 30) recommendations.push({ dimension: "hallucination_risk", action: "Replace unsupported approvals with assessments." });

  return {
    scores: {
      boardroom_readiness: round1(readiness),
      brand_compliance: round1(brand),
      evidence_integrity: round1(evidence),
      rtl: round1(rtl),
      slide_simplicity: round1(simplicity),
      visual_quality: round1(visual),
      executive_clarity: round1(exec),
      accessibility: round1(a11y),
      hallucination_risk: round1(halluc),
      template_compliance: round1(tmpl),
    },
    findings,
    recommendations,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------

function brandCompliance(
  { slides, ctx }: Inputs,
  findings: QualityReport["findings"],
): number {
  let total = 0;
  for (const slide of slides) {
    const used = collectUsedHexes(slide);
    const palette = validatePalette(used, ctx);
    const density = validateLayoutDensity(slide, ctx);
    const allText = [slide.title_en ?? "", slide.key_message_en ?? "", slide.title_ar ?? "", slide.key_message_ar ?? ""].join(" \n ");
    const tone = validateText(allText, ctx);
    if (tone.length) findings.push({ dimension: "brand_compliance", severity: "warn", message: tone[0].message });
    total += 0.4 * palette + 0.4 * density + 0.2 * (tone.length === 0 ? 100 : 60);
  }
  return slides.length ? total / slides.length : 100;
}

function collectUsedHexes(slide: Slide): string[] {
  const out: string[] = [];
  const palette = slide.visual_json?.palette ?? [];
  for (const c of palette) if (typeof c === "string") out.push(c);
  return out;
}

function evidenceIntegrity(
  { slides, evidence }: Inputs,
  findings: QualityReport["findings"],
): number {
  if (!slides.length) return 100;

  // Slides that don't need explicit evidence (cover, decision card, glossary,
  // appendix-style sections) shouldn't pull the score down.
  const isExempt = (s: Slide): boolean => {
    const k = (s.content_json as any)?.kind;
    if (k === "cover" || k === "decision" || k === "next_steps" || k === "stakeholder_map") return true;
    const t = (s.title_en ?? "").toLowerCase();
    if (t.includes("glossary") || t.includes("appendix") || t.includes("agenda")) return true;
    return false;
  };

  let evidenceable = 0;
  let withRefs = 0;
  for (const slide of slides) {
    if (isExempt(slide)) continue;
    evidenceable += 1;
    const refs = slide.evidence_refs ?? [];
    if (refs.length) withRefs += 1;
  }
  const ratio = evidenceable === 0 ? 1 : withRefs / evidenceable;
  if (ratio < 0.6) {
    findings.push({
      dimension: "evidence_integrity",
      severity: "warn",
      message: `${Math.round((1 - ratio) * 100)}% of evidence-bearing slides have no linked evidence`,
    });
  }

  // Bonus when the project has a well-classified evidence base. We reward
  // facts/assessments and only mildly penalise [Input Required] markers —
  // they are *good* discipline (the team flagged what they don't know) but
  // shouldn't dominate the deck.
  const facts = evidence.filter((e) => e.classification === "fact").length;
  const assessments = evidence.filter((e) => e.classification === "professional_assessment").length;
  const inputRequired = evidence.filter((e) => e.classification === "input_required").length;
  const evidenceBonus = Math.min(15, facts * 1.5 + assessments * 0.8);
  const inputPenalty = Math.min(8, inputRequired * 0.5);

  const base = 100 * ratio;
  return Math.max(0, Math.min(100, base + evidenceBonus - inputPenalty));
}

function rtlScore({ slides, ctx }: Inputs, findings: QualityReport["findings"]): number {
  if (!ctx.language.rtl_required) return 100;
  let sum = 0;
  for (const s of slides) {
    const r = validateSlideRtl(s, ctx);
    sum += r.score;
    if (r.findings.length) findings.push({ dimension: "rtl", severity: "warn", message: `Slide ${s.slide_number}: ${r.findings[0].rule}` });
  }
  return slides.length ? sum / slides.length : 100;
}

function slideSimplicity({ slides, ctx }: Inputs, _findings: QualityReport["findings"]): number {
  let sum = 0;
  for (const s of slides) sum += validateLayoutDensity(s, ctx);
  return slides.length ? sum / slides.length : 100;
}

function visualQuality({ slides }: Inputs, _findings: QualityReport["findings"]): number {
  // Reward structured visual layouts and a varied deck. Bullets-only decks
  // read flat; charts, timelines, KPI cards, decision cards, etc. earn full marks.
  const STRONG = new Set([
    "kpi", "timeline", "process", "matrix", "risk_heatmap", "before_after",
    "chart", "table", "stakeholder_map", "next_steps", "decision", "cover",
  ]);
  let sum = 0;
  const seenKinds = new Set<string>();
  for (const s of slides) {
    const k = (s.content_json as any)?.kind ?? "bullets";
    seenKinds.add(k);
    if (STRONG.has(k)) sum += 96;
    else if (k === "exec_summary") sum += 88;
    else sum += 72; // bullets — still legible, but weaker visual
  }
  const variety = Math.min(8, seenKinds.size); // up to +8 for a varied deck
  const base = slides.length ? sum / slides.length : 100;
  return Math.min(100, base + variety);
}

function executiveClarity({ slides }: Inputs, findings: QualityReport["findings"]): number {
  // Boardroom clarity comes from the *key message*, not the section title.
  // We score the title for legibility (no run-ons) and reward a statement-
  // style key message (≥6 words, ends with a period).
  let sum = 0;
  for (const s of slides) {
    const title = (s.title_en ?? "").trim();
    const km = (s.key_message_en ?? "").trim();
    let score = 78; // default — readable title, no key message guidance

    if (!title) {
      findings.push({ dimension: "executive_clarity", severity: "warn", message: `Slide ${s.slide_number}: missing title` });
      sum += 50;
      continue;
    }
    if (title.length < 4) {
      findings.push({ dimension: "executive_clarity", severity: "warn", message: `Slide ${s.slide_number}: weak title` });
      sum += 60;
      continue;
    }

    const titleWords = title.split(/\s+/).length;
    if (titleWords <= 9) score = 90; // crisp section label
    else if (titleWords <= 14) score = 82; // long title, still legible
    else score = 70;

    if (km) {
      const kmWords = km.split(/\s+/).length;
      const isStatement = /[.!?]$/.test(km);
      if (isStatement && kmWords >= 6 && kmWords <= 22) score += 8; // strong boardroom statement
      else if (isStatement) score += 4;
      else score += 2;
    }

    sum += Math.min(100, score);
  }
  return slides.length ? sum / slides.length : 100;
}

function accessibility({ slides }: Inputs, _findings: QualityReport["findings"]): number {
  // Boardroom accessibility: speaker notes, bilingual coverage, axis-titled
  // charts, descriptive titles, and named tables/timelines.
  let sum = 0;
  for (const s of slides) {
    let score = 78;
    if (s.speaker_notes_en) score += 8;
    if (s.speaker_notes_ar) score += 4;
    if (s.title_ar) score += 4;
    const k = (s.content_json as any)?.kind;
    if (k === "chart" && (s.content_json as any)?.spec?.title) score += 6;
    if (k === "table" || k === "next_steps") score += 4; // tabular data is screen-reader friendly
    if (k === "timeline" || k === "matrix") score += 4;
    sum += Math.min(100, score);
  }
  return slides.length ? sum / slides.length : 100;
}

function hallucinationRisk({ slides, evidence }: Inputs, findings: QualityReport["findings"]): number {
  if (!slides.length) return 0;
  let risk = 0;
  for (const s of slides) {
    const k = (s.content_json as any)?.kind;
    const exempt = k === "cover" || k === "decision" || k === "next_steps" || k === "stakeholder_map";
    const fakeApp = scanForFakeApproval([s.title_en, s.key_message_en, s.title_ar, s.key_message_ar].filter(Boolean).join(" "));
    if (!fakeApp.ok) {
      risk += 25;
      findings.push({ dimension: "hallucination_risk", severity: "error", message: `Slide ${s.slide_number}: fake approval detected` });
    }
    const refs = s.evidence_refs ?? [];
    if (!exempt && !refs.length) risk += 3;
    const hasNumbers = /\d/.test([s.key_message_en, s.title_en].filter(Boolean).join(" "));
    if (!exempt && hasNumbers && !refs.length) risk += 6;
  }
  // Adjust: presence of well-classified evidence reduces risk; explicit
  // input_required markers show discipline.
  const facts = evidence.filter((e) => e.classification === "fact").length;
  const required = evidence.filter((e) => e.classification === "input_required").length;
  risk -= Math.min(35, facts * 1.5 + required * 1.0);
  return Math.max(0, Math.min(100, risk));
}
