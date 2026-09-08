/**
 * Prompt Quality Scorer — 10 dimensions, 0-100 total.
 *
 * Extended from 5 to 10 dimensions:
 *   clarity, specificity, structure, audience, format (existing)
 *   + role, constraints, tone, examples, anti_hallucination (new)
 *
 * Each dimension contributes 0-10. Total = sum, capped at 100.
 * Bonus points are added for exceptionally strong prompts.
 *
 * Pure function, no DOM, no I/O.
 */

export interface QualityBreakdown {
  total: number;                  // 0..100
  tier: "low" | "mid" | "high" | "excellent";
  // Core dimensions (0-10 each)
  clarity: number;
  specificity: number;
  structure: number;
  audience: number;
  format: number;
  // New dimensions (0-10 each)
  role: number;
  constraints: number;
  tone: number;
  examples: number;
  anti_hallucination: number;
  // Qualitative flags
  strengths: string[];
  weaknesses: string[];
}

// ─── Regex patterns ────────────────────────────────────────────────────────
const HEADING_RE       = /(^|\n)\s*(#{1,4}|[A-Z][A-Za-z ]{2,30}:)\s/m;
const LIST_RE          = /(^|\n)\s*([-*•]|\d+\.)\s/m;
const NUMBER_RE        = /(?:^|\s)\d+(\.\d+)?(?:\s|$|%|st|nd|rd|th|k|m|b)/i;
const CODE_TOKEN_RE    = /`[^`]+`|\b[a-z][a-zA-Z0-9_]*\([a-zA-Z0-9_,\s]*\)/;
const EXAMPLE_RE       = /\b(for example|e\.g\.|example:|like this|such as|sample|مثال|على سبيل المثال|مثلاً)\b/i;
const ROLE_RE          = /\b(you are|act as|as a|role:|you're|your role|أنت|دورك|كخبير|بصفتك)\b/i;
const CONSTRAINT_RE    = /\b(avoid|do not|don't|no more than|max|limit|without|exclude|prohibited|forbidden|لا تذكر|تجنّب|بدون|حدّ أقصى|استثنِ)\b/i;
const TONE_RE          = /\b(tone:|professional|formal|casual|friendly|concise|detailed|academic|persuasive|neutral|technical|أسلوب:|رسمي|ودي|موجز|أكاديمي|حيادي|مقنع)\b/i;
const HALLUCINATION_RE = /\b(only.*verified|cite|source|don.t fabricate|unverified|mark speculation|no assumptions|don.t guess|تحقق|مصدر|فقط.*موثق|لا تتخمّن|ضع.*تخمين)\b/i;
const RESEARCH_RE      = /\b(research|report|analysis|study|data|statistics|reference|literature|بحث|تقرير|تحليل|دراسة|مرجع)\b/i;

const AUDIENCE_HINTS = [
  "audience", "for a", "for non-technical", "for developers", "for engineers",
  "for executives", "for ceo", "for cto", "beginners", "expert", "team",
  "child", "manager", "investor", "junior", "senior",
  "للقارئ", "للمستخدم", "للجمهور", "لمدير", "للمبتدئ", "للخبير", "للمستثمر", "للطالب", "للمطوّرين",
];

const FORMAT_HINTS = [
  "bullet", "bullets", "list", "table", "json", "yaml", "markdown", "headings",
  "numbered", "step-by-step", "outline", "summary", "tweet", "email", "checklist",
  "نقاط", "قائمة", "جدول", "خطوات", "ملخّص", "بريد", "تغريدة", "عناوين", "ماركداون",
];

const STRUCTURE_HINTS = [
  "context:", "role:", "goal:", "constraints:", "examples:", "tone:", "audience:",
  "format:", "output:", "return:", "deliverable:",
  "السياق:", "الدور:", "الهدف:", "القيود:", "المخرجات:", "الجمهور:", "النبرة:",
];

function clip(n: number, max = 10): number {
  return Math.min(max, Math.max(0, Math.round(n)));
}

function tierOf(total: number): QualityBreakdown["tier"] {
  if (total >= 88) return "excellent";
  if (total >= 70) return "high";
  if (total >= 45) return "mid";
  return "low";
}

export function scorePrompt(text: string): QualityBreakdown {
  const t = (text ?? "").trim();
  const empty: QualityBreakdown = {
    total: 0, tier: "low",
    clarity: 0, specificity: 0, structure: 0, audience: 0, format: 0,
    role: 0, constraints: 0, tone: 0, examples: 0, anti_hallucination: 0,
    strengths: [], weaknesses: [],
  };
  if (!t) return empty;

  const lower = t.toLowerCase();
  const words = t.split(/\s+/).filter(Boolean);
  const wc = words.length;
  const sentenceCount = Math.max(1, (t.match(/[.!?؟।]+/g) ?? []).length);
  const avgSentence = wc / sentenceCount;

  // ── 1. Clarity (0-10) ─────────────────────────────────────────────────────
  let clarity = 0;
  if (wc >= 8)  clarity += 2;
  if (wc >= 20) clarity += 2;
  if (wc >= 50) clarity += 2;
  if (wc >= 100) clarity += 1;
  if (avgSentence >= 4 && avgSentence <= 30) clarity += 3;
  clarity = clip(clarity);

  // ── 2. Specificity (0-10) ─────────────────────────────────────────────────
  let specificity = 0;
  if (NUMBER_RE.test(t))    specificity += 3;
  if (CODE_TOKEN_RE.test(t)) specificity += 3;
  const properNouns = (t.match(/\b[A-Z][a-z]{2,}\b/g) ?? []).length;
  if (properNouns >= 1) specificity += 2;
  if (properNouns >= 3) specificity += 2;
  specificity = clip(specificity);

  // ── 3. Structure (0-10) ───────────────────────────────────────────────────
  let structure = 0;
  if (HEADING_RE.test(t)) structure += 4;
  if (LIST_RE.test(t))    structure += 3;
  if (STRUCTURE_HINTS.some((h) => lower.includes(h))) structure += 2;
  if (t.split(/\n{2,}/).length >= 2) structure += 1;
  structure = clip(structure);

  // ── 4. Audience (0-10) ────────────────────────────────────────────────────
  let audience = 0;
  if (AUDIENCE_HINTS.some((h) => lower.includes(h))) audience += 7;
  if (/\b(I|we|you)\b/i.test(t) || /\b(أريد|نريد|أنت)\b/.test(t)) audience += 3;
  audience = clip(audience);

  // ── 5. Format (0-10) ──────────────────────────────────────────────────────
  let format = 0;
  if (FORMAT_HINTS.some((h) => lower.includes(h))) format += 7;
  if (/```|<code|<\/?\w+>/i.test(t))               format += 3;
  format = clip(format);

  // ── 6. Role (0-10) ────────────────────────────────────────────────────────
  let role = 0;
  if (ROLE_RE.test(t)) {
    role = 8;
    // Bonus if role is specific (named role)
    if (/\b(senior|expert|specialist|professor|consultant|analyst|manager|أول|خبير|متخصص|أستاذ|مستشار|محلل|مدير)\b/i.test(t)) role = 10;
  }
  role = clip(role);

  // ── 7. Constraints (0-10) ─────────────────────────────────────────────────
  let constraints = 0;
  if (CONSTRAINT_RE.test(t)) {
    constraints += 6;
    const constraintCount = (t.match(new RegExp(CONSTRAINT_RE.source, "gi")) ?? []).length;
    if (constraintCount >= 2) constraints += 4;
  }
  constraints = clip(constraints);

  // ── 8. Tone (0-10) ────────────────────────────────────────────────────────
  let tone = 0;
  if (TONE_RE.test(t)) {
    tone = 8;
    if (/tone:|نبرة:|أسلوب:/i.test(t)) tone = 10;
  }
  tone = clip(tone);

  // ── 9. Examples (0-10) ────────────────────────────────────────────────────
  let examples = 0;
  if (EXAMPLE_RE.test(t)) {
    examples += 6;
    // Multiple examples?
    const exampleMatches = (t.match(/\b(example|مثال)\b/gi) ?? []).length;
    if (exampleMatches >= 2) examples = 10;
  }
  examples = clip(examples);

  // ── 10. Anti-Hallucination (0-10) ─────────────────────────────────────────
  let anti_hallucination = 0;
  if (RESEARCH_RE.test(t)) {
    // Research-type prompts need source grounding
    if (HALLUCINATION_RE.test(t)) anti_hallucination = 10;
    else anti_hallucination = 2; // Small penalty for missing guardrails
  } else {
    // Non-research: neutral (doesn't penalise)
    anti_hallucination = 7;
  }
  anti_hallucination = clip(anti_hallucination);

  const total = Math.min(100, clarity + specificity + structure + audience + format + role + constraints + tone + examples + anti_hallucination);

  // ── Qualitative labels ─────────────────────────────────────────────────────
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (clarity >= 8)           strengths.push("Clear and well-sized prompt");
  if (specificity >= 7)       strengths.push("Uses specific details and numbers");
  if (structure >= 7)         strengths.push("Well-structured with sections");
  if (audience >= 7)          strengths.push("Target audience defined");
  if (format >= 7)            strengths.push("Output format specified");
  if (role >= 8)              strengths.push("Expert role assigned");
  if (constraints >= 6)       strengths.push("Includes constraints");
  if (tone >= 8)              strengths.push("Tone is specified");
  if (examples >= 6)          strengths.push("Examples provided");
  if (anti_hallucination >= 8) strengths.push("Source grounding included");

  if (clarity < 5)            weaknesses.push("Too short or vague");
  if (specificity < 4)        weaknesses.push("Lacks specific numbers or references");
  if (structure < 4)          weaknesses.push("No clear structure");
  if (audience < 4)           weaknesses.push("No target audience specified");
  if (format < 4)             weaknesses.push("Output format not defined");
  if (role < 5 && wc > 15)    weaknesses.push("No expert role assigned");
  if (constraints < 3 && wc > 20) weaknesses.push("No constraints or boundaries");
  if (tone < 5 && wc > 20)    weaknesses.push("Tone not specified");
  if (examples < 3 && wc > 25) weaknesses.push("No examples to guide the AI");
  if (anti_hallucination < 5 && RESEARCH_RE.test(t)) weaknesses.push("Missing anti-hallucination guardrails");

  return {
    total, tier: tierOf(total),
    clarity, specificity, structure, audience, format,
    role, constraints, tone, examples, anti_hallucination,
    strengths, weaknesses,
  };
}
