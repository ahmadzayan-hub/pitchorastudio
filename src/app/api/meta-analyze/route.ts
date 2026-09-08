import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { scorePrompt } from "@/lib/quality-score";
import { recommendMethod } from "@/lib/prompt-methods";
import type { MethodId } from "@/lib/prompt-methods";

/**
 * POST /api/meta-analyze
 *
 * Analyses a raw prompt using meta-prompt intelligence:
 * - Detects what's missing (context, role, format, audience, constraints)
 * - Scores it across 10 dimensions
 * - Identifies the strengths and weaknesses
 * - Generates an improved version
 * - Recommends the best method
 *
 * Pure local engine — no LLM round-trip required for speed.
 */

const Body = z.object({
  prompt: z.string().min(3).max(20_000),
  locale: z.enum(["en", "ar"]).optional().default("en"),
  method: z.string().optional(),
  intent: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    const result = Body.safeParse(await req.json());
    if (!result.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    parsed = result.data;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { prompt, locale, intent } = parsed;
  const ar = locale === "ar";

  // Score the prompt
  const score = scorePrompt(prompt);
  const words = prompt.split(/\s+/).filter(Boolean).length;

  // --- Strength / weakness analysis ---
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];

  const L = (en: string, ar_: string) => (ar ? ar_ : en);

  // Clarity (0-10 scale)
  if (score.clarity >= 7) {
    strengths.push(L("Well-structured sentences with good length", "جمل منظّمة بطول جيد"));
  } else if (score.clarity < 5) {
    weaknesses.push(L("Prompt is too vague or too short", "الموجِّه غامض أو قصير جدًا"));
    improvements.push(L("Add at least 2–3 sentences to provide context", "أضف جملتين إلى ثلاث جمل لتوفير السياق"));
  }

  // Specificity (0-10 scale)
  if (score.specificity >= 7) {
    strengths.push(L("Uses specific numbers and concrete details", "يستخدم أرقامًا محددة وتفاصيل ملموسة"));
  } else if (score.specificity < 4) {
    weaknesses.push(L("Lacks specific numbers, names, or technical terms", "يفتقر إلى أرقام أو أسماء أو مصطلحات تقنية محددة"));
    improvements.push(L("Include at least one number, metric, or named reference", "أضف رقمًا أو مقياسًا أو مرجعًا مسمّى على الأقل"));
  }

  // Structure (0-10 scale)
  if (score.structure >= 7) {
    strengths.push(L("Good use of headers and structured sections", "استخدام جيد للعناوين والأقسام المنظّمة"));
  } else if (score.structure < 4) {
    weaknesses.push(L("No clear structure or section breaks", "لا توجد بنية واضحة أو فواصل بين الأقسام"));
    improvements.push(L("Add headings like ## Goal, ## Context, ## Output Format", "أضف عناوين مثل ## الهدف، ## السياق، ## صيغة المخرج"));
  }

  // Audience (0-10 scale)
  if (score.audience >= 7) {
    strengths.push(L("Audience is clearly defined", "الجمهور محدد بوضوح"));
  } else if (score.audience < 4) {
    weaknesses.push(L("No target audience specified", "لم يتم تحديد الجمهور المستهدف"));
    improvements.push(L("Add 'for a [role/audience]' clause", "أضف عبارة 'لـ [الدور/الجمهور]'"));
  }

  // Format (0-10 scale)
  if (score.format >= 7) {
    strengths.push(L("Output format is well-defined", "صيغة المخرج محددة جيدًا"));
  } else if (score.format < 4) {
    weaknesses.push(L("Output format not specified", "صيغة المخرج غير محددة"));
    improvements.push(L("Specify the format: bullet list, table, JSON, paragraph, numbered list", "حدّد الصيغة: قائمة نقطية، جدول، JSON، فقرة، قائمة مرقمة"));
  }

  // Role check
  const hasRole = /\b(you are|act as|as a|role:|أنت|كخبير|بصفتك)\b/i.test(prompt);
  if (hasRole) {
    strengths.push(L("Expert role assigned to the AI", "تم تعيين دور خبير للذكاء الاصطناعي"));
  } else if (words > 15) {
    weaknesses.push(L("No expert role assigned", "لم يتم تعيين دور خبير"));
    improvements.push(L("Start with 'You are a [expert role]...'", "ابدأ بـ 'أنت [دور خبير]...'"));
  }

  // Constraints check
  const hasConstraints = /\b(avoid|do not|don't|no more than|max|limit|without|except|لا تذكر|تجنب|بدون|حدّ)\b/i.test(prompt);
  if (hasConstraints) {
    strengths.push(L("Includes constraints and boundaries", "يتضمن قيودًا وحدودًا"));
  } else if (words > 20) {
    improvements.push(L("Add constraints: what to avoid, max length, excluded topics", "أضف قيودًا: ما يجب تجنّبه، الحد الأقصى للطول، الموضوعات المستثناة"));
  }

  // Anti-hallucination check (for research/analysis)
  const isResearch = /\b(research|report|analysis|study|data|statistics|cite|reference|بحث|تقرير|تحليل|دراسة)\b/i.test(prompt);
  if (isResearch && !/\b(only|verify|source|cite|unverified|تحقق|مصدر|فقط)\b/i.test(prompt)) {
    weaknesses.push(L("No source-grounding or anti-hallucination guardrails", "لا توجد ضوابط تأسيس المصادر أو منع الهلوسة"));
    improvements.push(L("Add: 'Only use information you can verify. Mark speculation with [speculation].'", "أضف: 'استخدم فقط المعلومات التي يمكنك التحقق منها. ضع [تخمين] عند التخمين.'"));
  }

  // Tone check
  const hasTone = /\b(tone:|professional|formal|casual|friendly|concise|detailed|academic|أسلوب:|رسمي|ودي|موجز|أكاديمي)\b/i.test(prompt);
  if (!hasTone && words > 20) {
    improvements.push(L("Add a tone directive: 'Use a [tone] tone — professional, concise, friendly...'", "أضف توجيهًا للأسلوب: 'استخدم أسلوبًا [وصف الأسلوب] — رسميًا، موجزًا، وديًا...'"));
  }

  // --- Generate improved prompt ---
  const improvedPrompt = generateImprovedPrompt(prompt, { hasRole, hasConstraints, hasTone, score, ar, intent });

  // --- Recommended method ---
  const recommendedMethod: MethodId = recommendMethod(prompt, intent);

  return NextResponse.json(
    {
      score,
      strengths,
      weaknesses,
      improvements,
      improved_prompt: improvedPrompt,
      recommended_method: recommendedMethod,
      word_count: words,
      api_version: "v1",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

function generateImprovedPrompt(
  original: string,
  opts: {
    hasRole: boolean;
    hasConstraints: boolean;
    hasTone: boolean;
    score: ReturnType<typeof scorePrompt>;
    ar: boolean;
    intent?: string;
  }
): string {
  const { hasRole, hasConstraints, hasTone, score, ar } = opts;
  const lines: string[] = [];

  // Inject role if missing and prompt is substantive
  const words = original.split(/\s+/).filter(Boolean).length;
  if (!hasRole && words > 10) {
    lines.push(ar
      ? "أنت خبير متخصص في هذا المجال ذو خبرة واسعة.\n"
      : "You are a senior domain expert with extensive experience.\n");
  }

  // Add context header if missing structure
  if (score.structure < 10) {
    lines.push(ar ? "## السياق\n" : "## Context\n");
  }

  lines.push(original.trim());

  if (score.audience < 8) {
    lines.push(ar
      ? "\n## الجمهور المستهدف\nاذكر من هو الجمهور المستهدف (مثل: مدير تنفيذي، مطوّر، طالب دراسات عليا)."
      : "\n## Target Audience\n[Specify who will read this output — e.g., CFO, developer, MBA student]");
  }

  if (score.format < 8) {
    lines.push(ar
      ? "\n## صيغة المخرج\nقائمة نقطية / جدول / فقرة نثرية / JSON — اختر الأنسب."
      : "\n## Output Format\nBullet list / table / prose paragraph / JSON — choose the most appropriate.");
  }

  if (!hasConstraints) {
    lines.push(ar
      ? "\n## القيود\n- لا تذكر معلومات غير موثوقة.\n- الحد الأقصى: [أضف الحدّ]."
      : "\n## Constraints\n- Do not include unverified information.\n- Maximum length: [specify limit].");
  }

  if (!hasTone) {
    lines.push(ar
      ? "\n## الأسلوب\nرسمي ومهني — موجز ومبني على البيانات."
      : "\n## Tone\nProfessional and formal — concise and data-driven.");
  }

  lines.push(ar
    ? "\n## معيار النجاح\nالمخرج ناجح إذا كان [أضف المعيار]."
    : "\n## Success Criteria\nThe output is successful if [specify your success condition].");

  return lines.join("\n");
}
