/**
 * Curated free YouTube courses on prompt engineering and AI tooling.
 *
 * Every entry is an open-source / free-to-watch resource from a reputable
 * publisher (DeepLearning.AI, Anthropic, freeCodeCamp, OpenAI, Microsoft,
 * Google, Andrej Karpathy). No affiliate links, no paywalls.
 *
 * The list is intentionally small and high-signal. Adding a fourth video on
 * the same topic dilutes the page; pick the best one and stop.
 */

export interface LearnCourse {
  id: string;
  /** Author / channel — used for the byline */
  author: string;
  duration: string;          // e.g. "1h 30m"
  level: "beginner" | "intermediate" | "advanced";
  topics: ReadonlyArray<string>;
  /** YouTube video / playlist URL */
  url: string;
  /** Title and short blurb for both locales */
  title_en: string;
  title_ar: string;
  blurb_en: string;
  blurb_ar: string;
}

export const LEARN_COURSES: ReadonlyArray<LearnCourse> = [
  {
    id: "anthropic-prompt-engineering",
    author: "Anthropic",
    duration: "1h 17m",
    level: "beginner",
    topics: ["fundamentals", "Claude", "templates"],
    url: "https://www.youtube.com/playlist?list=PLf2m23nhTg1NaMm2cw9VFJP_tojp_28x_",
    title_en: "Prompt Engineering Interactive Tutorial",
    title_ar: "تعلّم هندسة الموجِّهات بشكل تفاعلي (Anthropic)",
    blurb_en: "Anthropic's official 9-chapter tutorial — best starting point for serious prompt engineering. Free, hands-on.",
    blurb_ar: "الدرس الرسمي لشركة Anthropic في 9 فصول. أفضل نقطة انطلاق لهندسة الموجِّهات بشكل جدّي. مجاني وتطبيقي."
  },
  {
    id: "deeplearningai-chatgpt-developers",
    author: "DeepLearning.AI · OpenAI",
    duration: "1h 30m",
    level: "beginner",
    topics: ["ChatGPT", "API", "prompts"],
    url: "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU",
    title_en: "ChatGPT Prompt Engineering for Developers",
    title_ar: "هندسة الموجِّهات في ChatGPT للمطوّرين",
    blurb_en: "Andrew Ng + Isa Fulford. Practical prompting patterns: summarising, inferring, transforming, expanding, chatbots.",
    blurb_ar: "Andrew Ng و Isa Fulford. أنماط عملية: التلخيص والاستنتاج والتحويل والتوسيع وبناء روبوتات الدردشة."
  },
  {
    id: "freecodecamp-prompt-engineering",
    author: "freeCodeCamp",
    duration: "5h 0m",
    level: "intermediate",
    topics: ["fundamentals", "patterns", "production"],
    url: "https://www.youtube.com/watch?v=_ZvnD73m40o",
    title_en: "Prompt Engineering Tutorial — Master ChatGPT and LLM Responses",
    title_ar: "دورة هندسة الموجِّهات الكاملة (freeCodeCamp)",
    blurb_en: "Five-hour open course covering everything from zero-shot to chain-of-thought, ReAct, and production tactics.",
    blurb_ar: "دورة مفتوحة بطول خمس ساعات تغطّي كل شيء من Zero-shot إلى Chain-of-Thought و ReAct وتكتيكات الإنتاج."
  },
  {
    id: "karpathy-llm-deep-dive",
    author: "Andrej Karpathy",
    duration: "3h 31m",
    level: "advanced",
    topics: ["LLM internals", "tokenization", "training"],
    url: "https://www.youtube.com/watch?v=7xTGNNLPyMI",
    title_en: "Deep Dive into LLMs Like ChatGPT",
    title_ar: "غوص عميق في نماذج اللغة الكبيرة (Karpathy)",
    blurb_en: "Karpathy walks through what an LLM actually does, from tokens to RLHF. Watch this once and your prompts get better.",
    blurb_ar: "Karpathy يشرح ما تفعله النماذج فعلًا، من التوكنز حتى RLHF. شاهدها مرّة وستتحسّن صياغة موجِّهاتك."
  },
  {
    id: "deeplearningai-functions-tools",
    author: "DeepLearning.AI",
    duration: "1h 0m",
    level: "intermediate",
    topics: ["function calling", "tools", "ChatGPT"],
    url: "https://www.youtube.com/playlist?list=PLoROMvodv4rPm_yz8LjPCJ_ZqDi6YsnlT",
    title_en: "Functions, Tools and Agents with LangChain",
    title_ar: "الدوال والأدوات والوكلاء مع LangChain",
    blurb_en: "How to design prompts that route through external tools (search, calculators, custom APIs).",
    blurb_ar: "كيف تصمّم موجِّهات توجِّه النموذج لاستخدام أدوات خارجية (بحث، حاسبة، APIs مخصّصة)."
  },
  {
    id: "google-gemini-cookbook",
    author: "Google · Gemini",
    duration: "45m",
    level: "intermediate",
    topics: ["Gemini", "vision", "long context"],
    url: "https://www.youtube.com/playlist?list=PLOU2XLYxmsIK-4S_22xOPxlP1MgABXz4Z",
    title_en: "Google Gemini Cookbook",
    title_ar: "كتاب طبخ Google Gemini",
    blurb_en: "Official Gemini examples: vision input, long context, video understanding, structured output.",
    blurb_ar: "أمثلة رسمية على Gemini: إدخال الصور، السياق الطويل، فهم الفيديو، المخرجات المهيكلة."
  },
  {
    id: "microsoft-prompt-engineering",
    author: "Microsoft",
    duration: "30m",
    level: "beginner",
    topics: ["fundamentals", "patterns"],
    url: "https://www.youtube.com/watch?v=jC4v5AS4RIM",
    title_en: "What is Prompt Engineering? — Microsoft Reactor",
    title_ar: "ما هي هندسة الموجِّهات؟ (Microsoft)",
    blurb_en: "Half-hour Microsoft Reactor session covering the basics with concrete examples for non-developers.",
    blurb_ar: "جلسة من Microsoft Reactor بطول نصف ساعة تغطّي الأساسيات بأمثلة ملموسة لغير المطوّرين."
  },
  {
    id: "deeplearningai-multi-modal",
    author: "DeepLearning.AI",
    duration: "55m",
    level: "intermediate",
    topics: ["images", "video", "vision"],
    url: "https://www.youtube.com/playlist?list=PLoROMvodv4rN5QQz0GaGvrW0u4LiQYy5x",
    title_en: "Prompting and Designing for Multimodal Models",
    title_ar: "صياغة الموجِّهات للنماذج متعدّدة الوسائط",
    blurb_en: "How to brief image and video models (Midjourney, Sora, SDXL): style, composition, negative prompts, seed control.",
    blurb_ar: "كيف توجِّه نماذج الصور والفيديو (Midjourney و Sora و SDXL): الأسلوب والتأطير و negative prompts و seed."
  }
];

export const LEARN_LEVELS = ["beginner", "intermediate", "advanced"] as const;
