/**
 * Layout builders.
 *
 * Each builder mutates a pptxgenjs slide in-place. Builders are pure of state
 * (the slide is the only sink) so they can be composed and unit-tested.
 */

import type { BrandRulesContext, ChartSpec, Slide, SlideModel } from "../types";
import { hex, SLIDE_W_IN, SLIDE_H_IN } from "./theme";
import { buildRuns, isArabic } from "./text";

export type Pptx = any;

const BODY_X = 0.5;
const BODY_W = SLIDE_W_IN - 1.0;

// Vertical layout for content slides (in inches). Tuned so the title
// band, key-message band, and body band don't overlap and respect the
// master's 1.5"-margin rule under the title.
const EYEBROW_Y = 0.5;
const TITLE_Y   = 0.78;
const TITLE_H   = 0.9;
const KEYMSG_Y  = 1.78;   // sits just under the master's accent rule at 1.52"
const KEYMSG_H  = 0.7;
const BODY_Y    = 2.55;   // body always starts here, no matter title length
const BODY_H    = SLIDE_H_IN - BODY_Y - 0.55;

export function addEyebrow(slide: any, slideModel: Slide, ctx: BrandRulesContext) {
  // Tiny all-caps section label — the visual breadcrumb above the title.
  const purpose = slideModel.purpose;
  if (!purpose) return;
  slide.addText(purpose.toUpperCase(), {
    x: ctx.layout.safe_margins_in,
    y: EYEBROW_Y,
    w: SLIDE_W_IN - 2 * ctx.layout.safe_margins_in,
    h: 0.25,
    fontFace: ctx.typography.en_primary,
    fontSize: 9,
    bold: true,
    color: hex(ctx.palette.primary),
    charSpacing: 4,
  });
}

export function addTitle(slide: any, slideModel: Slide, ctx: BrandRulesContext) {
  const margin = ctx.layout.safe_margins_in;
  const titleEn = slideModel.title_en;
  const titleAr = slideModel.title_ar;
  const enSize = ctx.typography.title_size_pt[1];
  const arSize = ctx.typography.title_size_pt[0];

  if (titleEn && titleAr) {
    // Side-by-side: EN left 60%, AR right 40% — never on the same baseline.
    slide.addText(buildRuns(titleEn, ctx, { bold: true, size: enSize }), {
      x: margin, y: TITLE_Y, w: (SLIDE_W_IN - 2 * margin) * 0.62, h: TITLE_H,
      align: "left", valign: "top", color: hex(ctx.palette.foreground),
    });
    slide.addText(buildRuns(titleAr, ctx, { bold: true, size: arSize, rtl: true, align: "right" }), {
      x: margin + (SLIDE_W_IN - 2 * margin) * 0.62,
      y: TITLE_Y, w: (SLIDE_W_IN - 2 * margin) * 0.38, h: TITLE_H,
      align: "right", valign: "top", rtl: true, color: hex(ctx.palette.foreground),
    });
  } else if (titleEn) {
    slide.addText(buildRuns(titleEn, ctx, { bold: true, size: enSize }), {
      x: margin, y: TITLE_Y, w: SLIDE_W_IN - 2 * margin, h: TITLE_H,
      align: "left", valign: "top", color: hex(ctx.palette.foreground),
    });
  } else if (titleAr) {
    slide.addText(buildRuns(titleAr, ctx, { bold: true, size: arSize, rtl: true, align: "right" }), {
      x: margin, y: TITLE_Y, w: SLIDE_W_IN - 2 * margin, h: TITLE_H,
      align: "right", valign: "top", rtl: true, color: hex(ctx.palette.foreground),
    });
  }
}

export function addKeyMessage(slide: any, slideModel: Slide, ctx: BrandRulesContext) {
  const margin = ctx.layout.safe_margins_in;
  const en = slideModel.key_message_en;
  const ar = slideModel.key_message_ar;
  const w = SLIDE_W_IN - 2 * margin;
  // Anchor the key message *below* the title rule. EN and AR get separate
  // single-line bands so RTL flow stays clean and they don't visually merge.
  if (en && ar) {
    slide.addText(buildRuns(en, ctx, { size: ctx.typography.body_size_pt[1], color: hex(ctx.palette.primary) }), {
      x: margin, y: KEYMSG_Y, w: w * 0.62, h: KEYMSG_H,
      valign: "top", color: hex(ctx.palette.primary),
    });
    slide.addText(buildRuns(ar, ctx, { size: ctx.typography.body_size_pt[1], rtl: true, align: "right", color: hex(ctx.palette.primary) }), {
      x: margin + w * 0.62, y: KEYMSG_Y, w: w * 0.38, h: KEYMSG_H,
      align: "right", rtl: true, valign: "top", color: hex(ctx.palette.primary),
    });
  } else if (en) {
    slide.addText(buildRuns(en, ctx, { size: ctx.typography.body_size_pt[1], color: hex(ctx.palette.primary) }), {
      x: margin, y: KEYMSG_Y, w, h: KEYMSG_H, valign: "top", color: hex(ctx.palette.primary),
    });
  } else if (ar) {
    slide.addText(buildRuns(ar, ctx, { size: ctx.typography.body_size_pt[1], rtl: true, align: "right", color: hex(ctx.palette.primary) }), {
      x: margin, y: KEYMSG_Y, w, h: KEYMSG_H, align: "right", rtl: true, valign: "top", color: hex(ctx.palette.primary),
    });
  }
}

export function renderSlideBody(slide: any, model: SlideModel, ctx: BrandRulesContext) {
  switch (model.kind) {
    case "cover":
      return renderCover(slide, model, ctx);
    case "exec_summary":
      return renderBullets(slide, model.bullets, ctx, "Executive Summary");
    case "decision":
      return renderDecision(slide, model, ctx);
    case "kpi":
      return renderKpi(slide, model, ctx);
    case "timeline":
      return renderTimeline(slide, model, ctx);
    case "process":
      return renderProcess(slide, model, ctx);
    case "matrix":
      return renderMatrix(slide, model, ctx);
    case "risk_heatmap":
      return renderRiskHeatmap(slide, model, ctx);
    case "before_after":
      return renderBeforeAfter(slide, model, ctx);
    case "chart":
      return renderChart(slide, model.spec, ctx);
    case "table":
      return renderTable(slide, model, ctx);
    case "stakeholder_map":
      return renderStakeholderMap(slide, model, ctx);
    case "next_steps":
      return renderNextSteps(slide, model, ctx);
    case "bullets":
      return renderBullets(slide, model.bullets, ctx);
    case "bilingual":
      return renderBilingual(slide, model, ctx);
  }
}

function renderCover(slide: any, m: { title: string; subtitle?: string; date?: string }, ctx: BrandRulesContext) {
  const accent = hex(ctx.palette.accent[0] ?? ctx.palette.secondary);
  // ── 4-band hero composition ─────────────────────────────────────
  // Tall accent rule on the leading edge — the boardroom "leading flag".
  slide.addShape("rect", {
    x: 0.6, y: 1.0, w: 0.16, h: 4.2,
    fill: { color: accent }, line: { color: accent, width: 0 },
  });
  // Eyebrow chip with the org name (high-contrast, small caps).
  slide.addShape("roundRect", {
    x: 0.95, y: 1.05, w: 4.0, h: 0.4, rectRadius: 0.08,
    fill: { color: accent, transparency: 80 },
    line: { color: accent, width: 0 },
  });
  slide.addText(ctx.identity.org_name.toUpperCase(), {
    x: 1.05, y: 1.07, w: 3.85, h: 0.36,
    fontFace: ctx.typography.en_primary, fontSize: 10.5, bold: true, color: "FFFFFF",
    charSpacing: 6, valign: "middle",
  });
  // Big cover title — boardroom scale.
  slide.addText(buildRuns(m.title, ctx, { bold: true, size: 54, color: "FFFFFF" }), {
    x: 0.95, y: 1.7, w: SLIDE_W_IN - 1.55, h: 2.6, fontFace: ctx.typography.en_primary,
    valign: "top",
  });
  // Underline rule between title and subtitle.
  slide.addShape("rect", {
    x: 0.95, y: 4.45, w: 1.6, h: 0.06,
    fill: { color: accent }, line: { color: accent, width: 0 },
  });
  if (m.subtitle) {
    slide.addText(buildRuns(m.subtitle, ctx, { size: 20, color: "FFFFFF" }), {
      x: 0.95, y: 4.65, w: SLIDE_W_IN - 1.6, h: 1.6, valign: "top",
    });
  }
  if (m.date) {
    slide.addText(m.date, {
      x: 0.95, y: SLIDE_H_IN - 1.0, w: 4, h: 0.35, fontSize: 11, color: "FFFFFF",
      fontFace: ctx.typography.en_primary, charSpacing: 2,
    });
  }
  // Footer label on the right — boardroom signature.
  slide.addText("PRESENTIQ · BOARDROOM-READY", {
    x: SLIDE_W_IN - 5.6, y: SLIDE_H_IN - 1.0, w: 5, h: 0.35,
    fontFace: ctx.typography.en_primary, fontSize: 9, bold: true, color: "FFFFFF",
    align: "right", charSpacing: 4,
  });
}

function renderBullets(slide: any, bullets: string[], ctx: BrandRulesContext, _title?: string) {
  const max = ctx.layout.max_bullets_per_slide;
  const list = bullets.slice(0, max);
  // Numbered indicator chips on the leading edge — modern boardroom "ruled list" feel.
  list.forEach((_, i) => {
    slide.addShape("ellipse", {
      x: BODY_X, y: BODY_Y + 0.05 + i * 0.65, w: 0.32, h: 0.32,
      fill: { color: hex(ctx.palette.primary) },
      line: { color: hex(ctx.palette.primary), width: 0 },
      shadow: { type: "outer", angle: 90, blur: 6, offset: 1.5, color: "000000", opacity: 0.18 },
    });
    slide.addText(String(i + 1), {
      x: BODY_X, y: BODY_Y + 0.05 + i * 0.65, w: 0.32, h: 0.32,
      fontFace: ctx.typography.en_primary, fontSize: 11, bold: true, color: "FFFFFF",
      align: "center", valign: "middle",
    });
  });
  const items = list.map((b) => ({
    text: b,
    options: {
      fontFace: isArabic(b) ? ctx.typography.ar_primary : ctx.typography.en_primary,
      fontSize: 17, paraSpaceAfter: 12,
      color: hex(ctx.palette.foreground),
      align: isArabic(b) ? "right" : "left",
      rtl: isArabic(b),
    },
  }));
  slide.addText(items, {
    x: BODY_X + 0.55, y: BODY_Y, w: BODY_W - 0.55, h: BODY_H, valign: "top",
  });
}

function renderDecision(slide: any, m: { recommendation: string; rationale: string[] }, ctx: BrandRulesContext) {
  const accent = hex(ctx.palette.accent[0] ?? ctx.palette.secondary);
  const cardX = 0.9, cardW = SLIDE_W_IN - 1.3;
  const recY = 1.5, recH = 1.85;
  // Recommendation card — primary fill, white text for boardroom emphasis.
  slide.addShape("roundRect", {
    x: cardX, y: recY, w: cardW, h: recH,
    fill: { color: hex(ctx.palette.primary) },
    line: { color: hex(ctx.palette.primary), width: 0 },
    rectRadius: 0.16,
    shadow: { type: "outer", angle: 90, blur: 22, offset: 6, color: "000000", opacity: 0.28 },
  });
  // Bronze/accent leading edge for contrast
  slide.addShape("rect", {
    x: cardX, y: recY, w: 0.22, h: recH,
    fill: { color: accent }, line: { color: accent, width: 0 },
  });
  // "RECOMMENDATION" eyebrow
  slide.addText("RECOMMENDATION", {
    x: cardX + 0.5, y: recY + 0.25, w: cardW - 0.8, h: 0.32,
    fontFace: ctx.typography.en_primary, fontSize: 10, bold: true,
    color: "FFFFFF", charSpacing: 6,
  });
  slide.addText(buildRuns(m.recommendation, ctx, { bold: true, size: 26, color: "FFFFFF" }), {
    x: cardX + 0.5, y: recY + 0.65, w: cardW - 0.8, h: recH - 0.85,
    valign: "middle",
  });
  // Rationale list — numbered cards instead of plain bullets.
  const ratY = recY + recH + 0.4;
  const ratH = SLIDE_H_IN - ratY - 0.5;
  const list = m.rationale.slice(0, ctx.layout.max_bullets_per_slide);
  const rowH = Math.min(0.62, ratH / Math.max(1, list.length));
  list.forEach((r, i) => {
    const ry = ratY + i * (rowH + 0.04);
    slide.addShape("ellipse", {
      x: cardX, y: ry + 0.05, w: 0.34, h: 0.34,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    slide.addText(String(i + 1), {
      x: cardX, y: ry + 0.05, w: 0.34, h: 0.34,
      fontFace: ctx.typography.en_primary, fontSize: 11, bold: true, color: "FFFFFF",
      align: "center", valign: "middle",
    });
    slide.addText(buildRuns(r, ctx, { size: 15, color: hex(ctx.palette.foreground) }), {
      x: cardX + 0.5, y: ry, w: cardW - 0.5, h: rowH,
      valign: "middle", align: isArabic(r) ? "right" : "left", rtl: isArabic(r),
    });
  });
}

function renderKpi(slide: any, m: { cards: { label: string; value: string; delta?: string }[] }, ctx: BrandRulesContext) {
  const cards = m.cards.slice(0, 4);
  const gap = 0.28;
  const w = (BODY_W - gap * (cards.length - 1)) / cards.length;
  const y = BODY_Y;
  const h = 2.6;
  const SHADOW = { type: "outer", angle: 90, blur: 18, offset: 5, color: "000000", opacity: 0.22 } as const;
  cards.forEach((c, i) => {
    const x = BODY_X + i * (w + gap);
    // Card body
    slide.addShape("roundRect", {
      x, y, w, h,
      fill: { color: hex(ctx.palette.surface) },
      line: { color: hex(ctx.palette.primary), width: 0.5 },
      rectRadius: 0.14,
      shadow: SHADOW,
    });
    // Top accent strip — taller for a clearer "stat card" silhouette.
    slide.addShape("roundRect", {
      x, y, w, h: 0.32,
      fill: { color: hex(ctx.palette.primary) },
      line: { color: hex(ctx.palette.primary), width: 0 },
      rectRadius: 0.14,
    });
    // Tiny status dot (left of label) for visual rhythm.
    slide.addShape("ellipse", {
      x: x + 0.22, y: y + 0.55, w: 0.14, h: 0.14,
      fill: { color: hex(ctx.palette.accent[0] ?? ctx.palette.secondary) },
      line: { color: hex(ctx.palette.primary), width: 0 },
    });
    // Label
    slide.addText(buildRuns(c.label.toUpperCase(), ctx, { size: 10, color: hex(ctx.palette.foreground) }), {
      x: x + 0.45, y: y + 0.5, w: w - 0.6, h: 0.35, align: "left",
      charSpacing: 5, bold: true,
    });
    // Big number
    slide.addText(buildRuns(c.value, ctx, { bold: true, size: 38, color: hex(ctx.palette.primary) }), {
      x: x + 0.22, y: y + 0.95, w: w - 0.4, h: 1.15, align: "left", valign: "middle",
    });
    // Footer separator
    slide.addShape("rect", {
      x: x + 0.22, y: y + h - 0.6, w: w - 0.44, h: 0.012,
      fill: { color: hex(ctx.palette.primary), transparency: 80 },
      line: { color: hex(ctx.palette.primary), width: 0 },
    });
    if (c.delta) {
      const positive = /^[+▲]/.test(c.delta) || /\+\s*\d/.test(c.delta);
      const deltaColor = positive
        ? hex(ctx.palette.accent[0] ?? ctx.palette.secondary)
        : hex(ctx.palette.accent[1] ?? ctx.palette.secondary);
      slide.addText(c.delta, {
        x: x + 0.22, y: y + h - 0.55, w: w - 0.4, h: 0.4, align: "left",
        fontFace: ctx.typography.en_primary, fontSize: 11, bold: true,
        color: deltaColor,
      });
    }
  });
}

function renderTimeline(slide: any, m: { milestones: { date: string; label: string; status?: string }[] }, ctx: BrandRulesContext) {
  const ms = m.milestones.slice(0, 6);
  if (!ms.length) return;
  const y = BODY_Y + 1.6;
  const x0 = 0.8;
  const x1 = SLIDE_W_IN - 0.8;
  // Track: a faint base line + a coloured progress segment for "now" milestones
  slide.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: hex(ctx.palette.primary), width: 1, transparency: 60 } });
  slide.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: hex(ctx.palette.primary), width: 2 } });
  const step = (x1 - x0) / Math.max(1, ms.length - 1);
  ms.forEach((mi, i) => {
    const x = x0 + step * i;
    // Outer ring (shadow halo)
    slide.addShape("ellipse", {
      x: x - 0.20, y: y - 0.20, w: 0.40, h: 0.40,
      fill: { color: hex(ctx.palette.surface) },
      line: { color: hex(ctx.palette.primary), width: 0 },
      shadow: { type: "outer", angle: 90, blur: 10, offset: 2, color: "000000", opacity: 0.30 },
    });
    // Outer dot (accent)
    slide.addShape("ellipse", {
      x: x - 0.14, y: y - 0.14, w: 0.28, h: 0.28,
      fill: { color: hex(ctx.palette.accent[0] ?? ctx.palette.secondary) },
      line: { color: "FFFFFF", width: 0 },
    });
    // Inner dot (primary)
    slide.addShape("ellipse", {
      x: x - 0.07, y: y - 0.07, w: 0.14, h: 0.14,
      fill: { color: hex(ctx.palette.primary) }, line: { color: "FFFFFF", width: 1.5 },
    });
    // Date pill above the dot
    slide.addShape("roundRect", {
      x: x - 0.55, y: y - 1.05, w: 1.1, h: 0.42, rectRadius: 0.18,
      fill: { color: hex(ctx.palette.primary) },
      line: { color: hex(ctx.palette.primary), width: 0 },
    });
    slide.addText(mi.date, {
      x: x - 0.55, y: y - 1.05, w: 1.1, h: 0.42, align: "center", valign: "middle",
      fontFace: ctx.typography.en_primary, fontSize: 11, bold: true, color: "FFFFFF",
    });
    // Label below
    slide.addText(buildRuns(mi.label, ctx, { size: 12, color: hex(ctx.palette.foreground) }), {
      x: x - 1.2, y: y + 0.35, w: 2.4, h: 1.1, align: "center", valign: "top",
    });
  });
}

function renderProcess(slide: any, m: { steps: { label: string; description?: string }[] }, ctx: BrandRulesContext) {
  const steps = m.steps.slice(0, 5);
  if (!steps.length) return;
  const y = BODY_Y + 0.4;
  const w = (BODY_W - 0.3 * (steps.length - 1)) / steps.length;
  steps.forEach((s, i) => {
    const x = 0.5 + i * (w + 0.3);
    slide.addShape("roundRect", { x, y, w, h: 1.4, fill: { color: hex(ctx.palette.primary) }, rectRadius: 0.1 });
    slide.addText(buildRuns(`${i + 1}. ${s.label}`, ctx, { bold: true, color: "FFFFFF", size: 16 }), {
      x, y: y + 0.2, w, h: 0.6, align: "center",
    });
    if (s.description) {
      slide.addText(buildRuns(s.description, ctx, { color: "FFFFFF", size: 11 }), {
        x: x + 0.1, y: y + 0.8, w: w - 0.2, h: 0.5, align: "center",
      });
    }
  });
}

function renderMatrix(slide: any, m: { rows: string[]; cols: string[]; cells: string[][] }, ctx: BrandRulesContext) {
  const headers = ["", ...m.cols];
  const rows = [headers, ...m.rows.map((r, i) => [r, ...(m.cells[i] ?? [])])];
  const tbl = rows.map((row, ri) =>
    row.map((cell, ci) => ({
      text: cell ?? "",
      options: {
        bold: ri === 0 || ci === 0,
        align: "center",
        valign: "middle",
        fill: { color: ri === 0 ? hex(ctx.palette.primary) : ci === 0 ? hex(ctx.palette.surface) : "FFFFFF" },
        color: ri === 0 ? "FFFFFF" : hex(ctx.palette.foreground),
        fontFace: ctx.typography.en_primary,
        fontSize: 12,
      },
    })),
  );
  slide.addTable(tbl, { x: BODY_X, y: BODY_Y, w: BODY_W, colW: undefined, rowH: 0.45 });
}

function renderRiskHeatmap(slide: any, m: { risks: { name: string; likelihood: 1 | 2 | 3; impact: 1 | 2 | 3 }[] }, ctx: BrandRulesContext) {
  const x0 = 1.5, y0 = BODY_Y + 0.1, cell = 1.3;
  // colors: 1=green 2=amber 3=red
  const palette = [["10B981","FBBF24","EF4444"],["10B981","F59E0B","EF4444"],["FBBF24","EF4444","B91C1C"]];
  for (let l = 0; l < 3; l++) {
    for (let i = 0; i < 3; i++) {
      const x = x0 + i * cell;
      const y = y0 + (2 - l) * cell;
      slide.addShape("rect", { x, y, w: cell - 0.05, h: cell - 0.05, fill: { color: palette[l][i] }, line: { color: "FFFFFF", width: 1 } });
    }
  }
  // Axes
  slide.addText("Impact", { x: x0, y: y0 + 3 * cell + 0.05, w: 3 * cell, h: 0.3, align: "center", fontSize: 11, fontFace: ctx.typography.en_primary });
  slide.addText("Likelihood", { x: x0 - 1.2, y: y0, w: 0.3, h: 3 * cell, align: "center", fontSize: 11, rotate: -90, fontFace: ctx.typography.en_primary });
  // Risks
  m.risks.slice(0, 12).forEach((r, idx) => {
    const x = x0 + (r.impact - 1) * cell + 0.1 + (idx % 2) * 0.5;
    const y = y0 + (3 - r.likelihood) * cell + 0.2 + Math.floor(idx / 2) * 0.25;
    slide.addShape("ellipse", { x, y, w: 0.18, h: 0.18, fill: { color: "111827" } });
    slide.addText(r.name, { x: x + 0.22, y: y - 0.05, w: 1.2, h: 0.3, fontSize: 9, fontFace: ctx.typography.en_primary });
  });
}

function renderBeforeAfter(slide: any, m: { before: string[]; after: string[] }, ctx: BrandRulesContext) {
  const colW = (SLIDE_W_IN - 1.5) / 2;
  const y = BODY_Y;
  const renderCol = (items: string[], x: number, label: string, color: string) => {
    slide.addShape("rect", { x, y, w: colW, h: 4.2, fill: { color: hex(color) }, line: { color: "FFFFFF", width: 0 } });
    slide.addText(label, { x: x + 0.2, y: y + 0.1, w: colW - 0.4, h: 0.5, fontFace: ctx.typography.en_primary, fontSize: 16, bold: true, color: "FFFFFF" });
    const list = items.slice(0, ctx.layout.max_bullets_per_slide).map((i) => ({
      text: i,
      options: { bullet: { code: "25CF" }, fontFace: isArabic(i) ? ctx.typography.ar_primary : ctx.typography.en_primary, fontSize: 13, color: "FFFFFF", rtl: isArabic(i), align: isArabic(i) ? "right" : "left" },
    }));
    slide.addText(list, { x: x + 0.2, y: y + 0.7, w: colW - 0.4, h: 3.4, valign: "top" });
  };
  renderCol(m.before, 0.5, "Before", ctx.palette.foreground);
  renderCol(m.after, 0.5 + colW + 0.5, "After", ctx.palette.secondary);
}

function renderChart(slide: any, spec: ChartSpec, ctx: BrandRulesContext) {
  const data = spec.series.map((s) => ({ name: s.name, labels: spec.categories, values: s.values }));
  const opts: any = {
    x: BODY_X, y: BODY_Y, w: BODY_W, h: BODY_H,
    chartColors: ctx.charts.palette.map(hex),
    showLegend: spec.showLegend ?? true,
    legendPos: "b",
    showTitle: !!spec.title,
    title: spec.title ?? "",
    titleColor: hex(ctx.palette.foreground),
    catAxisLabelFontSize: ctx.charts.label_size_pt,
    valAxisLabelFontSize: ctx.charts.label_size_pt,
    showCatAxisGridLines: ctx.charts.grid !== "minimal",
    showValAxisGridLines: ctx.charts.grid !== "minimal",
    showCatAxisLine: false,
    showValAxisLine: false,
  };
  // Map our kinds to pptxgenjs CHART types — done lazily because pptxgenjs is dynamic.
  const kindToType: Record<ChartSpec["kind"], string> = {
    column: "bar",
    stackedColumn: "bar",
    bar: "bar",
    line: "line",
    area: "area",
    pie: "pie",
    doughnut: "doughnut",
  };
  const t = kindToType[spec.kind] ?? "bar";
  if (spec.kind === "stackedColumn") opts.barGrouping = "stacked";
  if (spec.kind === "column") opts.barDir = "col";
  if (spec.kind === "bar") opts.barDir = spec.kind === "bar" ? "bar" : "col";
  slide.addChart(t as any, data, opts);
}

function renderTable(slide: any, m: { headers: string[]; rows: string[][] }, ctx: BrandRulesContext) {
  const header = m.headers.map((h) => ({
    text: h,
    options: { bold: true, fill: { color: hex(ctx.palette.primary) }, color: "FFFFFF", align: "center", fontFace: ctx.typography.en_primary, fontSize: 12 },
  }));
  const body = m.rows.map((r, ri) =>
    r.map((c) => ({
      text: c ?? "",
      options: {
        fontFace: isArabic(c) ? ctx.typography.ar_primary : ctx.typography.en_primary,
        align: isArabic(c) ? "right" : "left",
        rtl: isArabic(c),
        fontSize: 11,
        fill: { color: ri % 2 === 0 ? "FFFFFF" : hex(ctx.palette.surface) },
      },
    })),
  );
  slide.addTable([header, ...body], { x: BODY_X, y: BODY_Y, w: BODY_W, rowH: 0.4 });
}

function renderStakeholderMap(slide: any, m: { quadrants: any }, ctx: BrandRulesContext) {
  const x0 = 1.5, y0 = BODY_Y, w = SLIDE_W_IN - 3.0, h = SLIDE_H_IN - y0 - 0.9;
  const half = w / 2, halfH = h / 2;
  // Quadrant background
  slide.addShape("rect", { x: x0, y: y0, w, h, fill: { color: hex(ctx.palette.surface) }, line: { color: hex(ctx.palette.primary), width: 0.5 } });
  slide.addShape("line", { x: x0 + half, y: y0, w: 0, h, line: { color: hex(ctx.palette.primary), width: 0.5 } });
  slide.addShape("line", { x: x0, y: y0 + halfH, w, h: 0, line: { color: hex(ctx.palette.primary), width: 0.5 } });

  const place = (names: string[], qx: number, qy: number) => {
    const opts = names.slice(0, 4).map((n, i) => ({
      text: n, options: { bullet: { code: "25CF" }, fontFace: ctx.typography.en_primary, fontSize: 11, color: hex(ctx.palette.foreground) },
    }));
    slide.addText(opts, { x: qx + 0.1, y: qy + 0.1, w: half - 0.2, h: halfH - 0.2, valign: "top" });
  };
  place(m.quadrants.high_high ?? [], x0 + half, y0);
  place(m.quadrants.high_low ?? [], x0, y0);
  place(m.quadrants.low_high ?? [], x0 + half, y0 + halfH);
  place(m.quadrants.low_low ?? [], x0, y0 + halfH);

  // Axis labels
  slide.addText("Influence", { x: x0, y: y0 + h + 0.05, w, h: 0.3, align: "center", fontSize: 11, fontFace: ctx.typography.en_primary });
  slide.addText("Interest", { x: x0 - 1.2, y: y0, w: 0.3, h, align: "center", fontSize: 11, rotate: -90, fontFace: ctx.typography.en_primary });
}

function renderNextSteps(slide: any, m: { actions: { owner: string; due: string; action: string }[] }, ctx: BrandRulesContext) {
  const headers = ["Action", "Owner", "Due"];
  const rows = m.actions.slice(0, 6).map((a) => [a.action, a.owner, a.due]);
  renderTable(slide, { headers, rows }, ctx);
}

function renderBilingual(slide: any, m: { en: SlideModel; ar: SlideModel }, ctx: BrandRulesContext) {
  // Naive composition: render EN on left half, AR on right half by adjusting BODY_X/W via a sub-context.
  const halfW = (SLIDE_W_IN - 1.5) / 2;
  // We render each half as separate sub-slides? Instead we composite by adding visuals on each side via shapes/text.
  const sub: any = slide;
  // Just render bullets if both are bullets — this is the most common case for bilingual decks.
  if ((m.en as any).kind === "bullets" && (m.ar as any).kind === "bullets") {
    const en = (m.en as any).bullets as string[];
    const ar = (m.ar as any).bullets as string[];
    const enItems = en.slice(0, ctx.layout.max_bullets_per_slide).map((b) => ({
      text: b, options: { bullet: { code: "25CF" }, fontFace: ctx.typography.en_primary, fontSize: 14 },
    }));
    const arItems = ar.slice(0, ctx.layout.max_bullets_per_slide).map((b) => ({
      text: b, options: { bullet: { code: "25CF" }, fontFace: ctx.typography.ar_primary, fontSize: 14, rtl: true, align: "right" },
    }));
    sub.addText(enItems, { x: BODY_X, y: BODY_Y, w: halfW, h: BODY_H, valign: "top" });
    sub.addText(arItems, { x: BODY_X + halfW + 0.5, y: BODY_Y, w: halfW, h: BODY_H, valign: "top" });
  } else {
    // fallback: render the EN on the slide
    renderSlideBody(slide, m.en, ctx);
  }
}
