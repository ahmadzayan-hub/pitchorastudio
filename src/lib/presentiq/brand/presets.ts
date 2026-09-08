/**
 * Built-in brand presets.
 *
 * Order of resolution:
 *   1. Mode preset (e.g. corporate_boardroom)
 *   2. Organisation brand kit (if selected and applicable)
 *   3. Corporate default
 *
 * v0.5: every preset is organisation-agnostic. Names, fonts, and palettes
 * never reference a specific real-world entity. Customers bring their own
 * brand kit; we provide neutral starting points.
 */

import type { BrandRulesContext, PresentationMode } from "../types";

// Bilingual corporate boardroom terminology — neutral, no
// org-specific references. Use as a starting point for new brand kits.
export const bilingualTerminology: { en: string; ar: string }[] = [
  { en: "Corporate Entity", ar: "جهة مؤسسية" },
  { en: "Executive Committee", ar: "اللجنة التنفيذية" },
  { en: "Strategic Alignment", ar: "المواءمة الاستراتيجية" },
  { en: "Current Status", ar: "الوضع الراهن" },
  { en: "Key Risks", ar: "أبرز المخاطر" },
  { en: "Risk Mitigation", ar: "معالجة المخاطر" },
  { en: "Recommendation", ar: "التوصية" },
  { en: "Decision Required", ar: "القرار المطلوب" },
  { en: "Next Steps", ar: "الخطوات التالية" },
  { en: "Timeline", ar: "الجدول الزمني" },
  { en: "Stakeholder", ar: "صاحب المصلحة" },
  { en: "Operational Continuity", ar: "استمرارية التشغيل" },
  { en: "Customer Experience", ar: "تجربة المتعاملين" },
  { en: "Sustainability", ar: "الاستدامة" },
  { en: "Digital Transformation", ar: "التحوّل الرقمي" },
  { en: "Maintenance", ar: "الصيانة" },
  { en: "Asset Management", ar: "إدارة الأصول" },
  { en: "Safety", ar: "السلامة" },
  { en: "Quality", ar: "الجودة" },
  { en: "Compliance", ar: "الامتثال" },
  { en: "Audit", ar: "التدقيق" },
  { en: "Root Cause Analysis", ar: "تحليل السبب الجذري" },
  { en: "Corrective and Preventive Actions", ar: "الإجراءات التصحيحية والوقائية" },
];

// Backwards-compatible alias used by older callers — points at the same
// neutral terminology table.
export const corporateTerminology = bilingualTerminology;
/** @deprecated use `bilingualTerminology` */
export const rtaTerminology = bilingualTerminology;

const FORBIDDEN_GENERIC = [
  "we have decided",
  "approved by HE",
  "CEO confirmed",
  "guaranteed",
  "100% safe",
  "zero risk",
  "no risk at all",
];

const corporateDefault: BrandRulesContext = {
  identity: { org_name: "Your Organisation", logos: {} },
  palette: {
    primary: "#425722",   // Zaytouni — olive
    secondary: "#2A3815", // Deep olive
    accent: ["#7B8E58", "#B68B3E", "#F4F2E9", "#2A3815", "#A0AC78", "#D8B265"],
    background: "#FFFFFF",
    surface: "#FAF8EE",
    foreground: "#1B2410",
  },
  typography: {
    en_primary: "Inter",
    en_fallback: ["Calibri", "Arial"],
    ar_primary: "IBM Plex Sans Arabic",
    ar_fallback: ["Tajawal", "Noto Kufi Arabic", "Cairo"],
    title_size_pt: [32, 40],
    body_size_pt: [14, 20],
    line_height: 1.35,
  },
  layout: {
    logo_placement: "top_right",
    safe_margins_in: 0.4,
    max_words_per_slide: 80,
    max_bullets_per_slide: 5,
    slide_density: "low",
  },
  charts: {
    palette: ["#425722", "#7B8E58", "#B68B3E", "#A0AC78", "#D8B265", "#2A3815"],
    grid: "minimal",
    label_size_pt: 11,
  },
  iconography: { style: "line" },
  language: {
    tone: "formal_corporate",
    forbidden_phrases: [...FORBIDDEN_GENERIC],
    approved_terminology: [],
    arabic_required: false,
    rtl_required: false,
  },
  governance: {
    require_decision_slide: true,
    forbid_thank_you_slide: true,
    forbid_questions_slide: true,
    require_executive_summary: true,
    require_recommendation_slide: true,
    require_next_steps_slide: true,
  },
};

const uaePineBoardroom: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Government Entity", logos: {} },
  palette: {
    primary: "#013230",
    secondary: "#0B6E69",
    accent: ["#50C8C2", "#D1F2F0", "#0B6E69", "#013230", "#5EEAD4", "#A7F3D0"],
    background: "#FFFFFF",
    surface: "#F4FBFA",
    foreground: "#013230",
  },
  charts: {
    palette: ["#013230", "#0B6E69", "#50C8C2", "#5EEAD4", "#A7F3D0", "#D1F2F0"],
    grid: "minimal",
    label_size_pt: 11,
  },
  language: {
    tone: "government_executive",
    forbidden_phrases: [...FORBIDDEN_GENERIC, "approved by His Highness"],
    approved_terminology: bilingualTerminology,
    arabic_required: true,
    rtl_required: true,
  },
};

// Enterprise Sapphire boardroom preset — sapphire blue + crimson accent
// on a neutral sans stack. Generic enterprise palette suitable for any
// large corporate / public-sector entity.
const enterpriseBoardroom: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Enterprise", logos: {} },
  palette: {
    primary: "#1A2E64",     // Sapphire
    secondary: "#D81E05",   // Crimson
    accent: ["#0E1F4A", "#FFFFFF", "#F4F6FB", "#A6B0C9", "#FFC83D", "#11244F"],
    background: "#FFFFFF",
    surface: "#F5F7FC",
    foreground: "#0E1F4A",
  },
  typography: {
    en_primary: "Inter",
    en_fallback: ["Calibri", "Arial"],
    ar_primary: "IBM Plex Sans Arabic",
    ar_fallback: ["Tajawal", "Noto Kufi Arabic", "Cairo"],
    title_size_pt: [32, 40],
    body_size_pt: [14, 20],
    line_height: 1.35,
  },
  charts: {
    palette: ["#1A2E64", "#D81E05", "#0E1F4A", "#A6B0C9", "#FFC83D", "#11244F"],
    grid: "minimal",
    label_size_pt: 11,
  },
  language: {
    tone: "government_executive",
    forbidden_phrases: [...FORBIDDEN_GENERIC, "approved by His Highness"],
    approved_terminology: bilingualTerminology,
    arabic_required: true,
    rtl_required: true,
  },
};

const governmentBoardroom: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Government Entity", logos: {} },
  palette: {
    primary: "#013230",
    secondary: "#0B6E69",
    accent: ["#50C8C2", "#D1F2F0", "#5EEAD4", "#A7F3D0"],
    background: "#FFFFFF",
    surface: "#F4FBFA",
    foreground: "#013230",
  },
  language: {
    ...corporateDefault.language,
    tone: "government_executive",
    arabic_required: true,
    rtl_required: true,
    approved_terminology: bilingualTerminology,
  },
};

const consultingPartner: BrandRulesContext = {
  ...corporateDefault,
  identity: { org_name: "Consulting Firm", logos: {} },
  palette: {
    primary: "#425722",
    secondary: "#2A3815",
    accent: ["#B68B3E", "#D4AF37", "#7B8E58", "#F4F2E9"],
    background: "#FFFFFF",
    surface: "#FAF8EE",
    foreground: "#1B2410",
  },
  language: {
    ...corporateDefault.language,
    tone: "consulting_partner",
  },
};

// ─── Curated palettes ────────────────────────────────────────────────
// Hand-picked, modern boardroom palettes the wizard exposes as one-click
// "apply" cards. Each palette ships with a chart ramp and an EN+AR font
// suggestion; the foreground/background are tuned for WCAG AA contrast.

export type CuratedPalette = {
  id: string;
  nameEn: string;
  nameAr: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string[];
    background: string;
    surface: string;
    foreground: string;
  };
  charts: string[];
  fonts: {
    en_primary: string;
    ar_primary: string;
  };
};

export const CURATED_PALETTES: CuratedPalette[] = [
  // ── Zaian Sky (v0.4 default — indigo + cyan + magenta on deep navy) ──
  {
    id: "zaian-sky",
    nameEn: "Zaian Sky — Indigo & Magenta",
    nameAr: "سماء زيان — نيلي وفوشي",
    colors: {
      primary: "#6366F1", secondary: "#1A2456",
      accent: ["#8A6CF7", "#4DC9E6", "#E94B9F", "#C9D5F8", "#FFFFFF", "#0E1430"],
      background: "#0A0E2A", surface: "#161D44", foreground: "#F2F4FF",
    },
    charts: ["#6366F1", "#8A6CF7", "#4DC9E6", "#E94B9F", "#C9D5F8", "#1A2456"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  {
    id: "zaytouni",
    nameEn: "Zaytouni — Olive",
    nameAr: "زيتوني — أخضر زيتي",
    colors: {
      primary: "#425722", secondary: "#2A3815",
      accent: ["#7B8E58", "#B68B3E", "#F4F2E9", "#A0AC78", "#D8B265", "#2A3815"],
      background: "#FFFFFF", surface: "#FAF8EE", foreground: "#1B2410",
    },
    charts: ["#425722", "#7B8E58", "#B68B3E", "#A0AC78", "#D8B265", "#2A3815"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  {
    id: "midnight",
    nameEn: "Midnight — Indigo & Gold",
    nameAr: "منتصف الليل — نيلي وذهبي",
    colors: {
      primary: "#1E1B4B", secondary: "#312E81",
      accent: ["#6366F1", "#FBBF24", "#E0E7FF", "#A5B4FC", "#FDE68A", "#312E81"],
      background: "#FFFFFF", surface: "#F5F3FF", foreground: "#0F0E2C",
    },
    charts: ["#1E1B4B", "#6366F1", "#FBBF24", "#A5B4FC", "#FDE68A", "#312E81"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  {
    id: "sand",
    nameEn: "Sand — Bronze & Charcoal",
    nameAr: "رمل — برونزي وفحمي",
    colors: {
      primary: "#1F2937", secondary: "#B45309",
      accent: ["#D97706", "#92400E", "#FEF3C7", "#374151", "#9CA3AF", "#FBBF24"],
      background: "#FFFFFF", surface: "#FAF7F2", foreground: "#111827",
    },
    charts: ["#1F2937", "#B45309", "#D97706", "#92400E", "#9CA3AF", "#FBBF24"],
    fonts: { en_primary: "Source Sans 3", ar_primary: "Tajawal" },
  },
  {
    id: "slate",
    nameEn: "Boardroom — Slate & Emerald",
    nameAr: "قاعة المجلس — رمادي وزمردي",
    colors: {
      primary: "#0F172A", secondary: "#065F46",
      accent: ["#10B981", "#22D3EE", "#E2E8F0", "#94A3B8", "#34D399", "#1E293B"],
      background: "#FFFFFF", surface: "#F8FAFC", foreground: "#0F172A",
    },
    charts: ["#0F172A", "#10B981", "#22D3EE", "#94A3B8", "#34D399", "#1E293B"],
    fonts: { en_primary: "Inter", ar_primary: "Cairo" },
  },
  // ── Enterprise Sapphire (corporate sapphire + crimson accent) ───────
  {
    id: "enterprise-sapphire",
    nameEn: "Enterprise — Sapphire & Crimson",
    nameAr: "مؤسسي — ياقوتي وقرمزي",
    colors: {
      primary: "#1A2E64", secondary: "#D81E05",
      accent: ["#0E1F4A", "#FFFFFF", "#F4F6FB", "#A6B0C9", "#FFC83D", "#11244F"],
      background: "#FFFFFF", surface: "#F5F7FC", foreground: "#0E1F4A",
    },
    charts: ["#1A2E64", "#D81E05", "#0E1F4A", "#A6B0C9", "#FFC83D", "#11244F"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  // ── Obsidian (purple + charcoal — clean dark UI vibe) ──────────
  {
    id: "obsidian",
    nameEn: "Obsidian — Purple & Ink",
    nameAr: "أوبسيديان — بنفسجي وحبري",
    colors: {
      primary: "#7C3AED", secondary: "#1F1A2E",
      accent: ["#A78BFA", "#C4B5FD", "#0E0B1A", "#F4F1FB", "#9F7AEA", "#251D3A"],
      background: "#0E0B1A", surface: "#1F1A2E", foreground: "#F4F1FB",
    },
    charts: ["#7C3AED", "#A78BFA", "#C4B5FD", "#9F7AEA", "#F4F1FB", "#1F1A2E"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  // ── National Tricolour (generic government palette) ─────────────
  {
    id: "national-tricolour",
    nameEn: "National Tricolour — Black, Red, Green",
    nameAr: "ثلاثي الألوان الوطني — أسود وأحمر وأخضر",
    colors: {
      primary: "#000000", secondary: "#EF3340",
      accent: ["#00732F", "#FFFFFF", "#F4F4F4", "#1A1A1A", "#C99B2A", "#0E1F4A"],
      background: "#FFFFFF", surface: "#FAFAFA", foreground: "#0A0A0A",
    },
    charts: ["#000000", "#EF3340", "#00732F", "#C99B2A", "#A6A6A6", "#1A1A1A"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
  // ── Year of Hand-style (calligraphic Arabic, sky/teal) ─────────
  {
    id: "year-of-hand",
    nameEn: "Year of Hand — Sky & Calligraphy",
    nameAr: "العام — سماوي وخطّ يدوي",
    colors: {
      primary: "#1A4D5C", secondary: "#3FA9C4",
      accent: ["#8DC8DA", "#C9E4EF", "#1E3947", "#FFFFFF", "#F1B24A", "#0F2A33"],
      background: "#C9E4EF", surface: "#E7F2F7", foreground: "#0F2A33",
    },
    charts: ["#1A4D5C", "#3FA9C4", "#8DC8DA", "#F1B24A", "#1E3947", "#0F2A33"],
    fonts: { en_primary: "Lora", ar_primary: "Amiri" },
  },
  // ── Boardroom Light (clean white + emerald) ────────────────────
  {
    id: "boardroom-light",
    nameEn: "Boardroom Light — Emerald",
    nameAr: "قاعة المجلس — مضيء زمردي",
    colors: {
      primary: "#0F766E", secondary: "#115E59",
      accent: ["#14B8A6", "#5EEAD4", "#CCFBF1", "#0F172A", "#94A3B8", "#0D9488"],
      background: "#FFFFFF", surface: "#F0FDFA", foreground: "#0F172A",
    },
    charts: ["#0F766E", "#14B8A6", "#5EEAD4", "#94A3B8", "#0D9488", "#115E59"],
    fonts: { en_primary: "Inter", ar_primary: "IBM Plex Sans Arabic" },
  },
];

// Curated EN/AR font pairs — used by the brand-kit picker in the wizard.
export const FONT_PAIRS: { id: string; en: string; ar: string; label: string }[] = [
  { id: "inter-plex",    en: "Inter",          ar: "IBM Plex Sans Arabic", label: "Inter · IBM Plex Sans Arabic" },
  { id: "source-tajawal",en: "Source Sans 3",  ar: "Tajawal",              label: "Source Sans · Tajawal" },
  { id: "inter-cairo",   en: "Inter",          ar: "Cairo",                label: "Inter · Cairo" },
  { id: "lora-amiri",    en: "Lora",           ar: "Amiri",                label: "Lora · Amiri (formal)" },
  { id: "inter-ibm-arabic", en: "Inter",       ar: "IBM Plex Sans Arabic", label: "Inter · IBM Plex (corporate)" },
  { id: "inter-noto",    en: "Inter",          ar: "Noto Naskh Arabic",    label: "Inter · Noto Naskh (formal)" },
  { id: "inter-tajawal", en: "Inter",          ar: "Tajawal",              label: "Inter · Tajawal (modern)" },
  { id: "playfair-amiri",en: "Playfair Display",ar: "Amiri Quran",         label: "Playfair · Amiri (editorial)" },
  { id: "manrope-cairo", en: "Manrope",        ar: "Cairo",                label: "Manrope · Cairo (warm sans)" },
  { id: "system",        en: "system-ui",      ar: "system-ui",            label: "System default" },
];

// Standalone curated colour swatches — used when users want to mix-and-match
// a single accent into an existing palette. Each swatch ships with both an
// English and Arabic label so the picker stays bilingual.
export type CuratedColor = { id: string; nameEn: string; nameAr: string; hex: string };

export const CURATED_COLORS: CuratedColor[] = [
  { id: "sapphire",       nameEn: "Sapphire Blue",     nameAr: "أزرق ياقوتي",      hex: "#1A2E64" },
  { id: "crimson",        nameEn: "Crimson Red",       nameAr: "أحمر قرمزي",       hex: "#D81E05" },
  { id: "zaian-indigo",   nameEn: "Zaian Indigo",      nameAr: "نيلي زيان",          hex: "#6366F1" },
  { id: "zaian-violet",   nameEn: "Zaian Violet",      nameAr: "بنفسجي زيان",        hex: "#8A6CF7" },
  { id: "zaian-cyan",     nameEn: "Zaian Cyan",        nameAr: "سماوي زيان",         hex: "#4DC9E6" },
  { id: "zaian-magenta",  nameEn: "Zaian Magenta",     nameAr: "فوشي زيان",          hex: "#E94B9F" },
  { id: "zaian-sky",      nameEn: "Zaian Sky",         nameAr: "سماء زيان",          hex: "#C9D5F8" },
  { id: "zaian-deep",     nameEn: "Zaian Deep Navy",   nameAr: "كحلي زيان",          hex: "#1A2456" },
  { id: "national-red",   nameEn: "National Red",      nameAr: "أحمر وطني",         hex: "#EF3340" },
  { id: "national-green", nameEn: "National Green",    nameAr: "أخضر وطني",         hex: "#00732F" },
  { id: "national-black", nameEn: "National Black",    nameAr: "أسود وطني",         hex: "#000000" },
  { id: "obsidian-purple",nameEn: "Obsidian Purple",   nameAr: "بنفسجي أوبسيديان",  hex: "#7C3AED" },
  { id: "obsidian-ink",   nameEn: "Obsidian Ink",      nameAr: "حبر أوبسيديان",     hex: "#1F1A2E" },
  { id: "olive",          nameEn: "Zaytouni Olive",    nameAr: "زيتوني",            hex: "#425722" },
  { id: "bronze",         nameEn: "Boardroom Bronze",  nameAr: "برونزي",            hex: "#B68B3E" },
  { id: "emerald",        nameEn: "Boardroom Emerald", nameAr: "زمردي",             hex: "#10B981" },
  { id: "teal",           nameEn: "Spearmint Teal",    nameAr: "نعناعي مائل للأزرق", hex: "#14B8A6" },
  { id: "indigo",         nameEn: "Royal Indigo",      nameAr: "نيلي ملكي",          hex: "#1E1B4B" },
  { id: "amber",          nameEn: "Sand Amber",         nameAr: "كهرماني رملي",      hex: "#F4B63E" },
  { id: "saffron",        nameEn: "Saffron",            nameAr: "زعفراني",           hex: "#F1B24A" },
  { id: "year-sky",       nameEn: "Year-of-Hand Sky",  nameAr: "سماوي العام",        hex: "#3FA9C4" },
  { id: "ink-charcoal",   nameEn: "Ink Charcoal",      nameAr: "فحمي حبري",          hex: "#0F172A" },
  { id: "cream",          nameEn: "Boardroom Cream",   nameAr: "عاجي",               hex: "#F4F2E9" },
  { id: "pure-white",     nameEn: "Pure White",        nameAr: "أبيض نقي",           hex: "#FFFFFF" },
];

// Curated standalone Arabic fonts — discoverable in the brand-kit editor.
export type CuratedFont = { id: string; family: string; sample: string; nameEn: string; nameAr: string };

export const CURATED_AR_FONTS: CuratedFont[] = [
  { id: "ibm-plex-arabic", family: "IBM Plex Sans Arabic", sample: "العنوان", nameEn: "IBM Plex Sans Arabic", nameAr: "آي بي إم بلكس" },
  { id: "tajawal",         family: "Tajawal",              sample: "العنوان", nameEn: "Tajawal",              nameAr: "تجوّل" },
  { id: "cairo",           family: "Cairo",                sample: "العنوان", nameEn: "Cairo",                nameAr: "القاهرة" },
  { id: "amiri",           family: "Amiri",                sample: "العنوان", nameEn: "Amiri (Naskh)",        nameAr: "الأميري" },
  { id: "amiri-quran",     family: "Amiri Quran",          sample: "العنوان", nameEn: "Amiri Quran",          nameAr: "الأميري — مصحف" },
  { id: "noto-naskh",      family: "Noto Naskh Arabic",    sample: "العنوان", nameEn: "Noto Naskh",           nameAr: "نوتو نسخ" },
  { id: "noto-kufi",       family: "Noto Kufi Arabic",     sample: "العنوان", nameEn: "Noto Kufi",            nameAr: "نوتو كوفي" },
  { id: "scheherazade",    family: "Scheherazade New",     sample: "العنوان", nameEn: "Scheherazade",         nameAr: "شهرزاد" },
  { id: "lateef",          family: "Lateef",               sample: "العنوان", nameEn: "Lateef",               nameAr: "لطيف" },
];

export const CURATED_EN_FONTS: CuratedFont[] = [
  { id: "inter",            family: "Inter",            sample: "Title", nameEn: "Inter",            nameAr: "إنتر" },
  { id: "manrope",          family: "Manrope",          sample: "Title", nameEn: "Manrope",          nameAr: "مانروب" },
  { id: "source-sans",      family: "Source Sans 3",    sample: "Title", nameEn: "Source Sans 3",    nameAr: "سورس سانس" },
  { id: "lora",             family: "Lora",             sample: "Title", nameEn: "Lora (serif)",     nameAr: "لورا" },
  { id: "playfair",         family: "Playfair Display", sample: "Title", nameEn: "Playfair Display", nameAr: "بلاي فير" },
  { id: "merriweather",     family: "Merriweather",     sample: "Title", nameEn: "Merriweather",     nameAr: "ميري ويذر" },
  { id: "ibm-plex-sans",    family: "IBM Plex Sans",    sample: "Title", nameEn: "IBM Plex Sans",    nameAr: "آي بي إم بلكس" },
];

export const BUILT_IN_PRESETS: Record<PresentationMode | "default", BrandRulesContext> = {
  default: corporateDefault,
  corporate_boardroom: corporateDefault,
  government_boardroom: governmentBoardroom,
  enterprise_boardroom: enterpriseBoardroom,
  consulting_partner: consultingPartner,
  sales_pitch: corporateDefault,
  project_steering: corporateDefault,
  technical_to_executive: corporateDefault,
  strategy_deck: corporateDefault,
  kpi_dashboard: corporateDefault,
  training: corporateDefault,
  investor_business_case: corporateDefault,
  tender_proposal: corporateDefault,
};
