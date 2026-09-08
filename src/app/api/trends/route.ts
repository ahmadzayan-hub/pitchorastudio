import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

/**
 * GET /api/trends
 *
 * Returns daily-rotating trending prompt suggestions personalised to the user's
 * intent history and tuned for Middle-East / Arabic users.
 *
 * Query params:
 *   locale        "en" | "ar"            default "en"
 *   intents       comma-separated list   e.g. "coding,writing"   (from history)
 *   limit         1-12                   default 6
 *
 * No auth required — all personalisation runs server-side from the supplied
 * history signal; no PII is stored.
 */

const QuerySchema = z.object({
  locale: z.enum(["en", "ar"]).optional().default("en"),
  intents: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(12).optional().default(6),
});

export interface TrendItem {
  id: string;
  category: string;
  title: string;
  prompt: string;
  tags: string[];
  region?: "me" | "global";
}

// ---------------------------------------------------------------------------
// Trend catalogue — curated for Middle-East & Arabic context, updated daily
// by rotating via day-of-year index so content feels fresh without a DB.
// ---------------------------------------------------------------------------

const TRENDS_EN: TrendItem[] = [
  // ── Business & Entrepreneurship (ME focus) ────────────────────────────────
  { id: "me_biz_01", category: "business", region: "me",
    title: "Launch a startup in the UAE",
    prompt: "Write a step-by-step business plan for a SaaS startup targeting SMEs in the UAE, covering market sizing, licensing (freezone vs mainland), go-to-market, and a 12-month revenue forecast.",
    tags: ["startup", "UAE", "SaaS", "business plan"] },
  { id: "me_biz_02", category: "business", region: "me",
    title: "Saudi Vision 2030 opportunity analysis",
    prompt: "Analyse the top 5 business opportunities created by Saudi Vision 2030 for a foreign entrepreneur. Include market gaps, required local partnerships (Saudisation rules), and a prioritised entry roadmap.",
    tags: ["Saudi Arabia", "Vision 2030", "strategy"] },
  { id: "me_biz_03", category: "business", region: "me",
    title: "E-commerce in MENA",
    prompt: "Create a competitive analysis of the MENA e-commerce landscape (Noon, Amazon.ae, Talabat, Namshi). Identify one underserved niche an indie founder could enter with under $50k budget.",
    tags: ["e-commerce", "MENA", "competitive analysis"] },

  // ── Technology ────────────────────────────────────────────────────────────
  { id: "tech_01", category: "coding", region: "global",
    title: "Optimise a React component",
    prompt: "Refactor the following React component to eliminate unnecessary re-renders, add memoisation where appropriate, and explain each change with a one-line comment.",
    tags: ["React", "performance", "memoisation"] },
  { id: "tech_02", category: "coding", region: "global",
    title: "Build a REST API with Next.js",
    prompt: "Write a production-ready Next.js 14 API route that accepts a POST request, validates the body with Zod, inserts into a Supabase table, and returns a typed JSON response. Include error handling.",
    tags: ["Next.js", "API", "Supabase", "TypeScript"] },
  { id: "tech_03", category: "coding", region: "me",
    title: "Arabic NLP pipeline",
    prompt: "Design a Python NLP pipeline for Arabic text: tokenisation, diacritics removal, root extraction (using CAMeL Tools or PyArabic), sentiment classification, and output to JSON. Include code snippets.",
    tags: ["Arabic NLP", "Python", "AI", "NLP"] },

  // ── Writing & Content ─────────────────────────────────────────────────────
  { id: "write_01", category: "writing", region: "me",
    title: "Bilingual product description",
    prompt: "Write a compelling product description for a luxury date gift box (Medjool dates from Al Ahsa) in both English and Arabic. Tone: premium, cultural, gift-ready. Max 120 words per language.",
    tags: ["Arabic", "bilingual", "e-commerce copy"] },
  { id: "write_02", category: "writing", region: "me",
    title: "Ramadan campaign copy",
    prompt: "Generate a Ramadan marketing campaign for a fintech app: headline, 3 social-media captions (Instagram, X, LinkedIn), and a short email subject line. Tone: warm, community-driven, not overtly salesy.",
    tags: ["Ramadan", "marketing", "fintech", "social media"] },
  { id: "write_03", category: "writing", region: "global",
    title: "Thought-leadership LinkedIn post",
    prompt: "Write a 200-word LinkedIn post sharing an insight about AI adoption in the workplace. Use a hook opener, one personal anecdote, a clear takeaway, and a call to comment. Avoid buzzwords.",
    tags: ["LinkedIn", "thought leadership", "AI"] },

  // ── Research & Analysis ───────────────────────────────────────────────────
  { id: "research_01", category: "research", region: "me",
    title: "Gulf real estate market deep-dive",
    prompt: "Produce a structured research brief on Dubai real estate in 2025: price trends by district, off-plan vs secondary ratios, regulatory changes (golden visa, mortgage rules), and a 12-month outlook.",
    tags: ["Dubai", "real estate", "market research"] },
  { id: "research_02", category: "research", region: "me",
    title: "AI adoption in Arab enterprises",
    prompt: "Summarise the state of enterprise AI adoption across GCC countries: key sectors (banking, logistics, government), barriers to adoption, leading local vendors, and recommended next steps for a CTO.",
    tags: ["AI", "GCC", "enterprise", "CTO brief"] },
  { id: "research_03", category: "research", region: "global",
    title: "Competitive landscape report",
    prompt: "Create a structured competitive landscape report template for a B2B SaaS product. Include sections: market overview, top 5 competitors (strengths/weaknesses), feature matrix, pricing comparison, and strategic white space.",
    tags: ["competitive analysis", "SaaS", "B2B"] },

  // ── Creative & Design ─────────────────────────────────────────────────────
  { id: "creative_01", category: "creative", region: "me",
    title: "Arabic short story opener",
    prompt: "Write the opening 200 words of a contemporary Arabic short story set in a bustling souq in Marrakech. Use vivid sensory detail, an unreliable narrator, and end on a hook that makes the reader turn the page.",
    tags: ["Arabic fiction", "creative writing", "short story"] },
  { id: "creative_02", category: "design", region: "me",
    title: "Arabic UI design brief",
    prompt: "Write a detailed UI/UX design brief for a mobile banking app targeting Arabic-speaking users aged 25-40. Include RTL layout requirements, colour palette inspired by Islamic geometric patterns, accessibility guidelines, and 5 key user flows.",
    tags: ["RTL", "Arabic UI", "mobile design", "banking"] },

  // ── Education & Learning ──────────────────────────────────────────────────
  { id: "edu_01", category: "planning", region: "me",
    title: "Arabic language learning plan",
    prompt: "Build a 90-day self-study plan for an intermediate Arabic learner (Modern Standard Arabic + Egyptian dialect) targeting B2 CEFR. Include daily hour breakdown, top resources (apps, podcasts, tutors), and weekly milestones.",
    tags: ["Arabic", "language learning", "study plan"] },
  { id: "edu_02", category: "planning", region: "global",
    title: "AI prompt engineering curriculum",
    prompt: "Design a 4-week beginner curriculum for prompt engineering. Each week: learning objectives, 3 hands-on exercises, recommended readings, and a capstone mini-project. Tools: ChatGPT, Claude, Midjourney.",
    tags: ["prompt engineering", "AI education", "curriculum"] },

  // ── Career & HR ──────────────────────────────────────────────────────────
  { id: "career_01", category: "writing", region: "me",
    title: "CV for Gulf job market",
    prompt: "Rewrite my CV for a senior product manager role in Dubai. Adapt it to the Gulf hiring culture: lead with an objective summary, quantify achievements, highlight cross-cultural collaboration, and keep it to 2 pages in English.",
    tags: ["CV", "Dubai", "product manager", "career"] },
  { id: "career_02", category: "writing", region: "global",
    title: "Cold outreach email",
    prompt: "Write a cold outreach email to a VP of Engineering at a Series B startup asking for a 20-minute informational call. Be concise (under 100 words), lead with value, and close with a frictionless ask.",
    tags: ["cold email", "networking", "career"] },
];

const TRENDS_AR: TrendItem[] = [
  { id: "me_biz_01", category: "business", region: "me",
    title: "إطلاق شركة ناشئة في الإمارات",
    prompt: "اكتب خطة عمل تفصيلية لشركة SaaS ناشئة تستهدف الشركات الصغيرة والمتوسطة في الإمارات، تشمل: تحليل السوق، نوع الترخيص (منطقة حرة أو بر رئيسي)، خطة الدخول للسوق، وتوقعات الإيرادات لـ 12 شهرًا.",
    tags: ["ريادة أعمال", "الإمارات", "SaaS", "خطة عمل"] },
  { id: "me_biz_02", category: "business", region: "me",
    title: "تحليل فرص رؤية السعودية 2030",
    prompt: "حلّل أبرز 5 فرص تجارية يوفّرها برنامج رؤية المملكة 2030 لرائد أعمال أجنبي. اشمل فجوات السوق، متطلبات الشراكة المحلية (نسب السعودة)، وخارطة طريق دخول السوق بترتيب الأولويات.",
    tags: ["السعودية", "رؤية 2030", "استراتيجية"] },
  { id: "me_biz_03", category: "business", region: "me",
    title: "التجارة الإلكترونية في منطقة الشرق الأوسط",
    prompt: "أجرِ تحليلًا تنافسيًا لسوق التجارة الإلكترونية في منطقة الشرق الأوسط وشمال أفريقيا (نون، أمازون، طلبات، نمشي). حدّد نيشًا واحدًا غير مخدوم يستطيع مؤسس مستقل دخوله بميزانية أقل من 50 ألف دولار.",
    tags: ["تجارة إلكترونية", "الشرق الأوسط", "تحليل تنافسي"] },
  { id: "tech_03", category: "coding", region: "me",
    title: "خط أنابيب معالجة النصوص العربية",
    prompt: "صمّم خط أنابيب Python لمعالجة اللغة العربية: التقطيع، إزالة التشكيل، استخراج الجذر (باستخدام CAMeL Tools أو PyArabic)، تصنيف المشاعر، وتصدير النتائج بتنسيق JSON. اشمل مقاطع الكود.",
    tags: ["معالجة اللغة العربية", "Python", "ذكاء اصطناعي"] },
  { id: "write_01", category: "writing", region: "me",
    title: "وصف منتج ثنائي اللغة",
    prompt: "اكتب وصف منتج مقنعًا لصندوق هدايا تمر فاخر (تمر المدينة من الأحساء) باللغتين العربية والإنجليزية. الأسلوب: فاخر، ثقافي، مثالي للهدايا. بحد أقصى 120 كلمة لكل لغة.",
    tags: ["عربي", "ثنائي اللغة", "كتابة تسويقية"] },
  { id: "write_02", category: "writing", region: "me",
    title: "نصوص حملة رمضان",
    prompt: "أنشئ حملة تسويقية رمضانية لتطبيق مالي: عنوان رئيسي، 3 منشورات لمنصات التواصل (إنستغرام، تويتر X، لينكدإن)، وسطر موضوع بريد إلكتروني قصير. الأسلوب: دافئ، يركز على المجتمع، غير ترويجي بشكل صريح.",
    tags: ["رمضان", "تسويق", "تقنية مالية"] },
  { id: "research_01", category: "research", region: "me",
    title: "تحليل سوق العقارات في الخليج",
    prompt: "أعدّ ملخصًا بحثيًا منظّمًا عن سوق العقارات في دبي 2025: اتجاهات الأسعار حسب المنطقة، نسب المشاريع على الخارطة مقابل السوق الثانوي، التغييرات التنظيمية (التأشيرة الذهبية، قواعد الرهن العقاري)، وتوقعات 12 شهرًا.",
    tags: ["دبي", "عقارات", "بحث السوق"] },
  { id: "research_02", category: "research", region: "me",
    title: "تبنّي الذكاء الاصطناعي في المؤسسات العربية",
    prompt: "لخّص حالة تبنّي الذكاء الاصطناعي في مؤسسات دول مجلس التعاون الخليجي: القطاعات الرئيسية (المصارف، اللوجستيات، الحكومة)، عوائق التبنّي، أبرز الموردين المحليين، والخطوات الموصى بها لمدير تقنية المعلومات.",
    tags: ["ذكاء اصطناعي", "الخليج", "مؤسسات"] },
  { id: "creative_01", category: "creative", region: "me",
    title: "مستهل قصة قصيرة عربية",
    prompt: "اكتب الـ 200 كلمة الأولى من قصة قصيرة عربية معاصرة تدور أحداثها في سوق مراكش الصاخب. استخدم تفاصيل حسية حية، راويًا غير موثوق، وانهِها بخطّاف يجعل القارئ يتشوق لمعرفة ما يلي.",
    tags: ["كتابة إبداعية", "قصة قصيرة", "أدب عربي"] },
  { id: "creative_02", category: "design", region: "me",
    title: "ملخص تصميم واجهة عربية",
    prompt: "اكتب ملخص تصميم UI/UX تفصيليًا لتطبيق مصرفي للجوال يستهدف المستخدمين الناطقين بالعربية (25-40 عامًا). اشمل: متطلبات التخطيط من اليمين لليسار، لوحة ألوان مستوحاة من الزخارف الإسلامية، إرشادات إمكانية الوصول، و5 تدفقات مستخدم رئيسية.",
    tags: ["RTL", "واجهة عربية", "تصميم موبايل"] },
  { id: "edu_01", category: "planning", region: "me",
    title: "خطة تعلم اللغة العربية",
    prompt: "ضع خطة دراسة ذاتية مدتها 90 يومًا لمتعلم عربية متوسط (اللغة العربية الفصحى + اللهجة المصرية) يستهدف مستوى B2 وفق معايير CEFR. اشمل توزيع الساعات اليومية، أفضل الموارد (تطبيقات، بودكاست، معلمون)، ومعالم أسبوعية.",
    tags: ["اللغة العربية", "تعلم اللغات", "خطة دراسية"] },
  { id: "edu_02", category: "planning", region: "global",
    title: "منهج هندسة موجّهات الذكاء الاصطناعي",
    prompt: "صمّم منهجًا للمبتدئين مدته 4 أسابيع في هندسة موجّهات الذكاء الاصطناعي. لكل أسبوع: أهداف تعليمية، 3 تمارين عملية، قراءات موصى بها، ومشروع ختامي صغير. الأدوات: ChatGPT، Claude، Midjourney.",
    tags: ["هندسة موجّهات", "تعليم ذكاء اصطناعي"] },
  { id: "career_01", category: "writing", region: "me",
    title: "سيرة ذاتية لسوق عمل الخليج",
    prompt: "أعِد كتابة سيرتي الذاتية لوظيفة مدير منتج أول في دبي. كيّفها وفق ثقافة التوظيف الخليجية: ابدأ بملخص هدف مهني، كمّ الإنجازات، أبرز التعاون متعدد الثقافات، واضبط طولها على صفحتين باللغة الإنجليزية.",
    tags: ["سيرة ذاتية", "دبي", "مدير منتج", "مسيرة مهنية"] },
];

// ---------------------------------------------------------------------------
// Personalisation helpers
// ---------------------------------------------------------------------------

function dailySeed(): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const dayOfYear = Math.floor(
    (Date.UTC(year, now.getUTCMonth(), now.getUTCDate()) -
      Date.UTC(year, 0, 1)) / 86_400_000
  ) + 1;
  return year * 1000 + dayOfYear;
}

function scoreItem(item: TrendItem, preferredIntents: string[]): number {
  let score = 0;
  if (preferredIntents.includes(item.category)) score += 3;
  if (item.region === "me") score += 1;
  return score;
}

function selectTrends(
  catalogue: TrendItem[],
  preferredIntents: string[],
  limit: number
): TrendItem[] {
  const seed = dailySeed();

  // Stable daily shuffle using seed
  const shuffled = [...catalogue].sort((a, b) => {
    const ha = ((seed * 2654435761) ^ a.id.charCodeAt(0)) >>> 0;
    const hb = ((seed * 2654435761) ^ b.id.charCodeAt(0)) >>> 0;
    return ha - hb;
  });

  // Score by personalisation
  const scored = shuffled.map((item) => ({
    item,
    score: scoreItem(item, preferredIntents),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.item);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    locale: searchParams.get("locale") ?? undefined,
    intents: searchParams.get("intents") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_params", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { locale, intents, limit } = parsed.data;
  const preferredIntents = intents ? intents.split(",").map((s) => s.trim()) : [];
  const catalogue = locale === "ar" ? TRENDS_AR : TRENDS_EN;
  const trends = selectTrends(catalogue, preferredIntents, limit);

  return NextResponse.json(
    {
      api_version: "v1",
      locale,
      date: new Date().toISOString().slice(0, 10),
      trends,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
