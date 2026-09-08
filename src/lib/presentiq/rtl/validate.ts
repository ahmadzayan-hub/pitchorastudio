/**
 * Arabic RTL validator.
 *
 * Score = 100 - sum(penalties). A slide is RTL-pass at >= 90.
 */

import type { BrandRulesContext, Slide } from "../types";

const ARABIC_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

const ASCII_PUNCTUATION_IN_AR = /[A-Z][a-z]+\s*,/u; // Latin word followed by ASCII comma
const COLLOQUIAL_ARABIC = [
  "يلا",
  "خلاص",
  "مفيش",
  "ايه",
  "كده",
  "تمام",
];

export type RtlFinding = { rule: string; penalty: number; detail?: string };

export function validateSlideRtl(slide: Slide, ctx: BrandRulesContext): {
  score: number;
  findings: RtlFinding[];
} {
  if (!ctx.language.rtl_required) return { score: 100, findings: [] };

  const findings: RtlFinding[] = [];

  // Title-AR check
  const titleAr = slide.title_ar ?? "";
  const messageAr = slide.key_message_ar ?? "";

  if (ctx.language.arabic_required && !titleAr) {
    findings.push({ rule: "missing_arabic_title", penalty: 20 });
  }
  if (ctx.language.arabic_required && !messageAr) {
    findings.push({ rule: "missing_arabic_key_message", penalty: 10 });
  }

  // ASCII punctuation inside Arabic runs
  for (const text of [titleAr, messageAr]) {
    if (!text) continue;
    if (/[a-zA-Z],/.test(text) && ARABIC_RANGE.test(text)) {
      findings.push({ rule: "ascii_punctuation_in_arabic", penalty: 2 });
    }
    // ASCII question mark in Arabic
    if (text.endsWith("?") && ARABIC_RANGE.test(text)) {
      findings.push({ rule: "ascii_question_mark_in_arabic", penalty: 2 });
    }
  }

  // Forbidden colloquial words
  for (const text of [titleAr, messageAr]) {
    if (!text) continue;
    for (const word of COLLOQUIAL_ARABIC) {
      if (text.includes(word)) {
        findings.push({ rule: "colloquial_arabic", penalty: 15, detail: word });
      }
    }
  }

  // Required terminology
  for (const term of ctx.language.approved_terminology) {
    const inEn = (slide.title_en ?? "").includes(term.en) || (slide.key_message_en ?? "").includes(term.en);
    const inAr = titleAr.includes(term.ar) || messageAr.includes(term.ar);
    if (inEn && ctx.language.arabic_required && !inAr) {
      findings.push({
        rule: "missing_required_translation",
        penalty: 3,
        detail: `${term.en} → ${term.ar}`,
      });
    }
  }

  const score = Math.max(0, 100 - findings.reduce((s, f) => s + f.penalty, 0));
  return { score, findings };
}

/**
 * Replace ASCII punctuation that occurs inside an Arabic run with the Arabic counterpart.
 */
export function normaliseArabicPunctuation(text: string): string {
  if (!text || !ARABIC_RANGE.test(text)) return text;
  return text
    .replace(/,/g, "،")
    .replace(/;/g, "؛")
    .replace(/\?/g, "؟");
}
