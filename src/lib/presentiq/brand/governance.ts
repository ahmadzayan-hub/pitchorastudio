/**
 * Brand Governance Engine.
 *
 * Loads a BrandRulesContext from a brand kit row + mode + language,
 * locks it (Object.freeze recursive), and provides validators.
 */

import type {
  BrandRulesContext,
  LanguageMode,
  PresentationMode,
  Slide,
} from "../types";
import { BUILT_IN_PRESETS } from "./presets";

type BrandKitRow = {
  id: string;
  organization_id: string;
  name: string;
  is_default: boolean;
  logos?: unknown;
  colors?: unknown;
  fonts?: unknown;
  typography_rules?: unknown;
  layout_rules?: unknown;
  chart_rules?: unknown;
  terminology?: unknown;
  forbidden_patterns?: unknown;
  compliance_rules?: unknown;
  design_tokens?: unknown;
  layout_library?: unknown;
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
function asObj<T extends object>(v: unknown, fallback: T): T {
  return v && typeof v === "object" ? ({ ...fallback, ...(v as object) } as T) : fallback;
}

export function loadBrandContext(
  kit: BrandKitRow | null,
  mode: PresentationMode,
  language: LanguageMode,
  orgName?: string,
): Readonly<BrandRulesContext> {
  const preset = BUILT_IN_PRESETS[mode] ?? BUILT_IN_PRESETS.default;

  // Merge kit overrides on top of preset
  const colors = asObj(kit?.colors, preset.palette);
  const fonts = asObj(kit?.fonts, preset.typography);
  const typography_rules = asObj(kit?.typography_rules, {
    title_size_pt: preset.typography.title_size_pt,
    body_size_pt: preset.typography.body_size_pt,
    line_height: preset.typography.line_height,
  });
  const layout_rules = asObj(kit?.layout_rules, preset.layout);
  const chart_rules = asObj(kit?.chart_rules, preset.charts);
  const terminology = asObj<{
    approved?: { en: string; ar: string }[];
    forbidden?: string[];
  }>(kit?.terminology, {});
  const forbidden_patterns = asArray<string>(kit?.forbidden_patterns);
  const logos = asArray<{ url: string; placement?: string; locale?: string }>(kit?.logos);

  const arabicRequired =
    preset.language.arabic_required || language === "ar" || language === "bilingual";
  const rtlRequired = preset.language.rtl_required || arabicRequired;

  const ctx: BrandRulesContext = {
    identity: {
      org_name: orgName ?? preset.identity.org_name,
      logos: {
        primary:
          logos.find((l) => !l.locale || l.locale === "en")?.url ?? preset.identity.logos.primary,
        mono: logos.find((l) => l.locale === "mono")?.url ?? preset.identity.logos.mono,
        ar: logos.find((l) => l.locale === "ar")?.url ?? preset.identity.logos.ar,
      },
    },
    palette: { ...preset.palette, ...(colors as object) } as BrandRulesContext["palette"],
    typography: {
      ...preset.typography,
      ...(fonts as object),
      title_size_pt: (typography_rules as any).title_size_pt ?? preset.typography.title_size_pt,
      body_size_pt: (typography_rules as any).body_size_pt ?? preset.typography.body_size_pt,
      line_height: (typography_rules as any).line_height ?? preset.typography.line_height,
    } as BrandRulesContext["typography"],
    layout: { ...preset.layout, ...(layout_rules as object) } as BrandRulesContext["layout"],
    charts: { ...preset.charts, ...(chart_rules as object) } as BrandRulesContext["charts"],
    iconography: preset.iconography,
    language: {
      ...preset.language,
      arabic_required: arabicRequired,
      rtl_required: rtlRequired,
      forbidden_phrases: [
        ...preset.language.forbidden_phrases,
        ...(terminology.forbidden ?? []),
        ...forbidden_patterns,
      ],
      approved_terminology: [
        ...preset.language.approved_terminology,
        ...(terminology.approved ?? []),
      ],
    },
    governance: preset.governance,
  };

  return deepFreeze(ctx);
}

function deepFreeze<T>(o: T): Readonly<T> {
  Object.freeze(o);
  if (o && typeof o === "object") {
    for (const v of Object.values(o as object)) deepFreeze(v as object);
  }
  return o;
}

// ---------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------

export type Violation = {
  rule: string;
  severity: "info" | "warn" | "error";
  message: string;
};

export function validateText(text: string, ctx: BrandRulesContext): Violation[] {
  const out: Violation[] = [];
  if (!text) return out;
  const lower = text.toLowerCase();
  for (const phrase of ctx.language.forbidden_phrases) {
    if (lower.includes(phrase.toLowerCase())) {
      out.push({
        rule: "forbidden_phrase",
        severity: "error",
        message: `Forbidden phrase detected: "${phrase}"`,
      });
    }
  }
  return out;
}

export function validatePalette(usedHexes: string[], ctx: BrandRulesContext): number {
  if (!usedHexes.length) return 100;
  const allowed = new Set(
    [
      ctx.palette.primary,
      ctx.palette.secondary,
      ctx.palette.background,
      ctx.palette.surface,
      ctx.palette.foreground,
      ...ctx.palette.accent,
      ...ctx.charts.palette,
    ].map((c) => c.toLowerCase()),
  );
  const offBrand = usedHexes.filter((h) => !allowed.has(h.toLowerCase())).length;
  return Math.max(0, 100 - offBrand * 10);
}

export function validateLayoutDensity(slide: Slide, ctx: BrandRulesContext): number {
  const text = countWords(slide);
  const max = ctx.layout.max_words_per_slide;
  if (text <= max) return 100;
  const overflow = text - max;
  return Math.max(0, 100 - overflow * 1.5);
}

function countWords(slide: Slide): number {
  const buckets: string[] = [];
  buckets.push(slide.title_en ?? "", slide.title_ar ?? "");
  buckets.push(slide.key_message_en ?? "", slide.key_message_ar ?? "");
  walkContent(slide.content_json, (s) => buckets.push(s));
  return buckets.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

function walkContent(node: any, visit: (s: string) => void): void {
  if (node == null) return;
  if (typeof node === "string") {
    visit(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((c) => walkContent(c, visit));
    return;
  }
  if (typeof node === "object") {
    for (const v of Object.values(node)) walkContent(v, visit);
  }
}
