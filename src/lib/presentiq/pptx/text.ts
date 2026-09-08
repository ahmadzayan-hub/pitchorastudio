/**
 * Multi-run text helpers — handles mixed Arabic / English runs and RTL paragraph
 * properties via pptxgenjs's `addText` array form.
 */

import type { BrandRulesContext } from "../types";
import { hex } from "./theme";

const ARABIC_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function isArabic(text: string): boolean {
  return ARABIC_RANGE.test(text ?? "");
}

export type RunOpts = {
  bold?: boolean;
  size?: number;
  color?: string;
  fontFace?: string;
  align?: "left" | "right" | "center";
  rtl?: boolean;
  lang?: string;
};

export function buildRuns(text: string, ctx: BrandRulesContext, base: RunOpts = {}): any[] {
  if (!text) return [];
  // Split paragraphs preserving order; within a paragraph, we split AR vs EN runs.
  const paragraphs = text.split(/\r?\n/);
  const runs: any[] = [];
  paragraphs.forEach((p, idx) => {
    const segments = splitArabicRuns(p);
    segments.forEach((seg) => {
      const ar = isArabic(seg);
      runs.push({
        text: seg,
        options: {
          ...base,
          rtl: ar ? true : base.rtl,
          align: ar ? "right" : base.align ?? "left",
          fontFace: ar ? ctx.typography.ar_primary : base.fontFace ?? ctx.typography.en_primary,
          lang: ar ? "ar-AE" : base.lang ?? "en-US",
          color: base.color ?? hex(ctx.palette.foreground),
          fontSize: base.size,
          bold: base.bold,
        },
      });
    });
    if (idx < paragraphs.length - 1) {
      runs.push({ text: "", options: { breakLine: true } });
    }
  });
  return runs;
}

function splitArabicRuns(line: string): string[] {
  if (!line) return [""];
  // Group consecutive arabic chars vs non-arabic chars.
  const out: string[] = [];
  let cur = "";
  let curArabic = isArabic(line[0]);
  for (const ch of line) {
    const a = isArabic(ch);
    if (a === curArabic) {
      cur += ch;
    } else {
      if (cur) out.push(cur);
      cur = ch;
      curArabic = a;
    }
  }
  if (cur) out.push(cur);
  return out;
}
