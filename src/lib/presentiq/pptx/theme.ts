/**
 * Build a pptxgenjs theme + masters from a BrandRulesContext.
 *
 * pptxgenjs does not expose theme1.xml clrScheme overrides, so the brand
 * palette is applied via:
 *   1. Background fills on the four custom masters (PQ_COVER, PQ_CONTENT,
 *      PQ_DIVIDER, PQ_DECISION).
 *   2. Inline text colours, shape fills, and chart palettes added by the
 *      layout builders (see layouts.ts).
 *   3. Master-level adornments — a thin rule above the footer, the org
 *      name on the left, and a slide-number on the right of every content
 *      slide. Cover gets a single accent rule across the bottom.
 *
 * This module imports pptxgenjs lazily so the package can be optional in
 * environments that don't render PPTX (e.g. unit tests).
 */

import type { BrandRulesContext } from "../types";

export const SLIDE_W_IN = 13.333; // 16:9 widescreen
export const SLIDE_H_IN = 7.5;

export type Pptx = any;
export async function loadPptxGen(): Promise<any> {
  const mod: any = await import("pptxgenjs");
  return mod.default ?? mod;
}

export async function buildDeck(ctx: BrandRulesContext, title: string): Promise<Pptx> {
  const PptxGen = await loadPptxGen();
  const pptx = new PptxGen();
  pptx.title = title;
  pptx.author = "Pitchora";
  pptx.company = ctx.identity.org_name;
  pptx.layout = "LAYOUT_WIDE";
  pptx.defineLayout({ name: "LAYOUT_WIDE", width: SLIDE_W_IN, height: SLIDE_H_IN });

  defineMasters(pptx, ctx);
  return pptx;
}

function defineMasters(pptx: any, ctx: BrandRulesContext) {
  const margin = ctx.layout.safe_margins_in;
  const logoOpts = logoPlacement(ctx);
  const primary = hex(ctx.palette.primary);
  const secondary = hex(ctx.palette.secondary);
  const accent = hex(ctx.palette.accent[0] ?? ctx.palette.secondary);
  const surface = hex(ctx.palette.surface);
  const foreground = hex(ctx.palette.foreground);

  // ----- Cover master -----
  pptx.defineSlideMaster({
    title: "PQ_COVER",
    background: { color: primary },
    objects: [
      ...maybeLogo(ctx, logoOpts),
      // Accent rule across the bottom of the cover
      { rect: { x: 0,                   y: SLIDE_H_IN - 0.18, w: SLIDE_W_IN * 0.32, h: 0.18, fill: { color: accent } } },
      { rect: { x: SLIDE_W_IN * 0.32,   y: SLIDE_H_IN - 0.18, w: SLIDE_W_IN * 0.68, h: 0.18, fill: { color: secondary } } },
    ],
    slideNumber: { x: 0, y: 0, w: 0, h: 0, fontSize: 1, color: "FFFFFF" }, // hide on cover
  });

  // ----- Content master -----
  pptx.defineSlideMaster({
    title: "PQ_CONTENT",
    background: { color: hex(ctx.palette.background) },
    objects: [
      ...maybeLogo(ctx, logoOpts),
      // Thin accent rule under the title band
      { rect: { x: margin, y: margin + 1.5, w: SLIDE_W_IN - 2 * margin, h: 0.02, fill: { color: primary } } },
      // Footer rule
      { rect: { x: margin, y: SLIDE_H_IN - 0.36, w: SLIDE_W_IN - 2 * margin, h: 0.012, fill: { color: surface } } },
      // Footer brand mark (left)
      {
        text: {
          text: ctx.identity.org_name,
          options: {
            x: margin, y: SLIDE_H_IN - 0.32, w: 6, h: 0.28,
            fontFace: ctx.typography.en_primary, fontSize: 9, color: foreground,
          },
        },
      },
    ],
    slideNumber: {
      x: SLIDE_W_IN - margin - 0.6, y: SLIDE_H_IN - 0.32, w: 0.6, h: 0.28,
      fontFace: ctx.typography.en_primary, fontSize: 9, color: foreground, align: "right",
    },
  });

  // ----- Divider master -----
  pptx.defineSlideMaster({
    title: "PQ_DIVIDER",
    background: { color: surface },
    objects: maybeLogo(ctx, logoOpts),
  });

  // ----- Decision master -----
  pptx.defineSlideMaster({
    title: "PQ_DECISION",
    background: { color: hex(ctx.palette.background) },
    objects: [
      ...maybeLogo(ctx, logoOpts),
      // Strong leading rule down the side
      { rect: { x: 0, y: 0, w: 0.4, h: SLIDE_H_IN, fill: { color: primary } } },
      // "DECISION REQUIRED" eyebrow at the top
      {
        text: {
          text: "DECISION REQUIRED",
          options: {
            x: 0.7, y: 0.5, w: 6, h: 0.4,
            fontFace: ctx.typography.en_primary, fontSize: 11, bold: true,
            color: primary, charSpacing: 4,
          },
        },
      },
    ],
    slideNumber: {
      x: SLIDE_W_IN - margin - 0.6, y: SLIDE_H_IN - 0.32, w: 0.6, h: 0.28,
      fontFace: ctx.typography.en_primary, fontSize: 9, color: foreground, align: "right",
    },
  });
}

function logoPlacement(ctx: BrandRulesContext): { x: number; y: number; w: number; h: number } {
  const margin = ctx.layout.safe_margins_in;
  const w = 1.5;
  const h = 0.6;
  if (ctx.layout.logo_placement === "top_left") {
    return { x: margin, y: margin, w, h };
  }
  if (ctx.layout.logo_placement === "balanced_center") {
    return { x: (SLIDE_W_IN - w) / 2, y: margin, w, h };
  }
  return { x: SLIDE_W_IN - margin - w, y: margin, w, h };
}

function maybeLogo(ctx: BrandRulesContext, p: { x: number; y: number; w: number; h: number }) {
  if (!ctx.identity.logos.primary) return [];
  return [
    {
      image: {
        path: ctx.identity.logos.primary,
        x: p.x, y: p.y, w: p.w, h: p.h,
        sizing: { type: "contain", w: p.w, h: p.h },
      },
    },
  ];
}

export function hex(h: string): string {
  return h.replace("#", "").toUpperCase();
}
