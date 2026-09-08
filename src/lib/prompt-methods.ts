/**
 * Prompt Engineering Intelligence — method catalogue.
 *
 * Each method has bilingual metadata, use-case hints, an example, and
 * a builder function that scaffolds a prompt given basic inputs.
 */

export type MethodId =
  | "craft"
  | "task"
  | "role"
  | "zero_shot"
  | "few_shot"
  | "chain"
  | "meta"
  | "structured"
  | "socratic"
  | "critique"
  | "rag";

export interface PromptMethod {
  id: MethodId;
  emoji: string;
  color: string;              // Tailwind bg class for the icon
  name_en: string;
  name_ar: string;
  tagline_en: string;
  tagline_ar: string;
  desc_en: string;
  desc_ar: string;
  best_for_en: string[];
  best_for_ar: string[];
  example_en: string;
  example_ar: string;
  complexity: "beginner" | "intermediate" | "advanced";
}

export const PROMPT_METHODS: PromptMethod[] = [
  {
    id: "craft",
    emoji: "🎯",
    color: "bg-brand-500",
    name_en: "CRAFT",
    name_ar: "إطار كرافت",
    tagline_en: "Context · Role · Audience · Format · Tone",
    tagline_ar: "السياق · الدور · الجمهور · الصيغة · الأسلوب",
    desc_en: "A structured 5-part framework. Define Context, assign a Role, specify the Audience, set the Format, and choose the Tone. Perfect starting point for any AI task.",
    desc_ar: "إطار منهجي من خمسة محاور. حدّد السياق، وعيّن دورًا، وحدّد الجمهور، واختر الصيغة والأسلوب. نقطة البداية المثالية لأي مهمة ذكاء اصطناعي.",
    best_for_en: ["Business reports", "Marketing copy", "Email drafts", "Presentations"],
    best_for_ar: ["التقارير التجارية", "النصوص التسويقية", "مسودات البريد", "العروض التقديمية"],
    example_en: "Context: Q3 performance review. Role: Senior analyst. Audience: CFO. Format: Bullet summary. Tone: Concise and data-driven.",
    example_ar: "السياق: مراجعة أداء الربع الثالث. الدور: محلل أول. الجمهور: المدير المالي. الصيغة: ملخص نقطي. الأسلوب: موجز ومبني على البيانات.",
    complexity: "beginner",
  },
  {
    id: "task",
    emoji: "⚡",
    color: "bg-amber-500",
    name_en: "Task-Based",
    name_ar: "قائم على المهمة",
    tagline_en: "Start directly with the action verb",
    tagline_ar: "ابدأ مباشرةً بفعل الإجراء",
    desc_en: "Lead with a clear action verb — summarize, analyze, write, classify, compare, translate, generate. Best when the task is obvious and needs no role setup.",
    desc_ar: "ابدأ بفعل إجراء واضح: لخّص، حلّل، اكتب، صنّف، قارن، ترجم، أنتج. الأفضل حين تكون المهمة واضحة ولا تحتاج إعدادًا للدور.",
    best_for_en: ["Quick summaries", "Data extraction", "Translation", "Classification"],
    best_for_ar: ["الملخصات السريعة", "استخراج البيانات", "الترجمة", "التصنيف"],
    example_en: "Summarize this 5-page contract into a 200-word executive brief, highlighting risks and obligations.",
    example_ar: "لخّص هذا العقد المكوّن من 5 صفحات في ملخص تنفيذي لا يتجاوز 200 كلمة، مع إبراز المخاطر والالتزامات.",
    complexity: "beginner",
  },
  {
    id: "role",
    emoji: "🧑‍💼",
    color: "bg-emerald-500",
    name_en: "Role Prompting",
    name_ar: "التوجيه بالدور",
    tagline_en: "Assign an expert persona to the AI",
    tagline_ar: "عيّن شخصية خبير للذكاء الاصطناعي",
    desc_en: "Assign a specific expert role before giving the task. 'You are a [role].' tightens vocabulary, tone, and depth. Works for any domain expert.",
    desc_ar: "عيّن دورًا متخصصًا قبل إعطاء المهمة. 'أنت [خبير...]' يضيق نطاق المفردات والأسلوب والعمق. يعمل لأي خبير في أي مجال.",
    best_for_en: ["Expert analysis", "Legal review", "Financial modelling", "HR decisions"],
    best_for_ar: ["التحليل المتخصص", "المراجعة القانونية", "النمذجة المالية", "قرارات الموارد البشرية"],
    example_en: "You are a senior investment banker specializing in MENA markets. Analyze this startup's 3-year P&L and flag the top 3 financial risks.",
    example_ar: "أنت مصرفي استثماري أول متخصص في أسواق الشرق الأوسط وشمال أفريقيا. حلّل قوائم الأرباح والخسائر لثلاث سنوات لهذه الشركة الناشئة وحدّد أبرز 3 مخاطر مالية.",
    complexity: "beginner",
  },
  {
    id: "zero_shot",
    emoji: "🎲",
    color: "bg-sky-500",
    name_en: "Zero-Shot",
    name_ar: "توجيه صفري",
    tagline_en: "No examples — just a clear direct instruction",
    tagline_ar: "بدون أمثلة — فقط تعليمة مباشرة وواضحة",
    desc_en: "Give the AI a clear task without examples. Works when the task is simple and the model's general knowledge is sufficient. Fast and low-friction.",
    desc_ar: "أعطِ الذكاء الاصطناعي مهمة واضحة دون أمثلة. يعمل حين تكون المهمة بسيطة ومعرفة النموذج العامة كافية. سريع وبدون تعقيد.",
    best_for_en: ["Simple Q&A", "Factual lookup", "Short generation tasks"],
    best_for_ar: ["الأسئلة والأجوبة البسيطة", "البحث الحقيقي", "مهام الإنشاء القصيرة"],
    example_en: "What are the 5 biggest cultural considerations for marketing a luxury brand in Saudi Arabia?",
    example_ar: "ما هي أبرز 5 اعتبارات ثقافية عند تسويق علامة تجارية فاخرة في المملكة العربية السعودية؟",
    complexity: "beginner",
  },
  {
    id: "few_shot",
    emoji: "📚",
    color: "bg-violet-500",
    name_en: "Few-Shot",
    name_ar: "توجيه بالأمثلة",
    tagline_en: "Show 1–3 examples so the AI mimics your style",
    tagline_ar: "أظهر 1–3 أمثلة حتى يحاكي الذكاء الاصطناعي أسلوبك",
    desc_en: "Provide one to three input-output examples before the real task. The AI learns your expected format, tone, and structure from the examples.",
    desc_ar: "قدّم مثالًا إلى ثلاثة أمثلة على المدخل والمخرج قبل المهمة الحقيقية. يتعلم الذكاء الاصطناعي صيغتك المتوقعة وأسلوبك وبنيتك من الأمثلة.",
    best_for_en: ["Style matching", "Data labelling", "Pattern extraction", "Classification"],
    best_for_ar: ["مطابقة الأسلوب", "تسمية البيانات", "استخراج الأنماط", "التصنيف"],
    example_en: "Example 1 — Input: 'Product X launch delayed.' → Output: 'Launch Risk: Product X delayed — escalate to steering committee.' Now classify: 'Q3 budget overrun by 12%.'",
    example_ar: "مثال 1 — المدخل: 'تأخّر إطلاق المنتج X.' ← المخرج: 'خطر الإطلاق: تأخّر المنتج X — ارفع للجنة التوجيه.' الآن صنّف: 'تجاوز ميزانية الربع الثالث بنسبة 12٪.'",
    complexity: "intermediate",
  },
  {
    id: "chain",
    emoji: "⛓️",
    color: "bg-orange-500",
    name_en: "Chain Prompting",
    name_ar: "التوجيه التسلسلي",
    tagline_en: "Break complex tasks into sequential micro-steps",
    tagline_ar: "قسّم المهام المعقدة إلى خطوات متتالية صغيرة",
    desc_en: "Break a complex task into a series of smaller focused prompts, each feeding into the next. Improves accuracy for multi-stage analysis, writing, or planning.",
    desc_ar: "قسّم مهمة معقدة إلى سلسلة من التوجيهات الصغيرة المركّزة، كل منها يغذّي التالي. يُحسّن الدقة للتحليل متعدد المراحل والكتابة والتخطيط.",
    best_for_en: ["Business analysis", "Research synthesis", "Multi-step plans", "Long documents"],
    best_for_ar: ["التحليل التجاري", "تركيب البحوث", "الخطط متعددة الخطوات", "المستندات الطويلة"],
    example_en: "Step 1: Identify the 3 key problems in this market. Step 2: For each problem, list 2 solution approaches. Step 3: Score each approach on feasibility and ROI.",
    example_ar: "الخطوة 1: حدّد أبرز 3 مشكلات في هذا السوق. الخطوة 2: لكل مشكلة، اذكر نهجَين للحل. الخطوة 3: قيّم كل نهج على أساس الجدوى والعائد على الاستثمار.",
    complexity: "intermediate",
  },
  {
    id: "meta",
    emoji: "🧠",
    color: "bg-fuchsia-500",
    name_en: "Meta Prompting",
    name_ar: "التوجيه الميتا",
    tagline_en: "Ask the AI to design or improve the prompt itself",
    tagline_ar: "اطلب من الذكاء الاصطناعي تصميم الموجِّه أو تحسينه",
    desc_en: "Ask the AI to generate, improve, or critique a prompt for you. Ideal when you know the goal but don't know how to prompt for it. The AI becomes your prompt engineer.",
    desc_ar: "اطلب من الذكاء الاصطناعي إنشاء موجِّه أو تحسينه أو انتقاده. مثالي حين تعرف الهدف لكن لا تعرف كيف تصوغ الموجِّه. يصبح الذكاء الاصطناعي مهندس موجّهاتك.",
    best_for_en: ["Prompt iteration", "Getting unstuck", "Prompt optimization", "Learning"],
    best_for_ar: ["تكرار الموجّهات", "الخروج من الجمود", "تحسين الموجّهات", "التعلم"],
    example_en: "I want to generate a strategic analysis of the UAE retail sector for my board. Write me the optimal prompt that would produce a boardroom-quality output.",
    example_ar: "أريد إنشاء تحليل استراتيجي لقطاع التجزئة في الإمارات لمجلس إدارتي. اكتب لي الموجِّه الأمثل الذي سينتج مخرجًا يليق بمجلس الإدارة.",
    complexity: "intermediate",
  },
  {
    id: "structured",
    emoji: "🏗️",
    color: "bg-teal-500",
    name_en: "Structured Prompting",
    name_ar: "التوجيه المنظّم",
    tagline_en: "Build with labelled sections: Goal · Context · Constraints · Format",
    tagline_ar: "ابنِ بأقسام مُعنوَنة: الهدف · السياق · القيود · الصيغة",
    desc_en: "Use explicit section headers to organize the prompt. Each section (Goal, Context, Input Data, Constraints, Output Format, Audience, Tone) is labelled, making complex tasks unambiguous.",
    desc_ar: "استخدم عناوين أقسام صريحة لتنظيم الموجِّه. كل قسم (الهدف، السياق، بيانات الإدخال، القيود، صيغة الإخراج، الجمهور، الأسلوب) مُعنوَن، مما يجعل المهام المعقدة لا لبس فيها.",
    best_for_en: ["Complex analysis", "Executive reports", "MBA assignments", "System prompts"],
    best_for_ar: ["التحليل المعقد", "التقارير التنفيذية", "تكاليف الماجستير", "موجّهات النظام"],
    example_en: "## Goal\nAnalyze risks.\n## Context\nM&A deal in Saudi healthcare, $200M.\n## Constraints\nMax 400 words. No assumptions.\n## Output Format\nTable with risk, likelihood, mitigation.",
    example_ar: "## الهدف\nتحليل المخاطر.\n## السياق\nصفقة اندماج وشراء في الرعاية الصحية السعودية، 200 مليون دولار.\n## القيود\n400 كلمة بحد أقصى. لا افتراضات.\n## صيغة المخرج\nجدول بالخطر والاحتمالية والتخفيف.",
    complexity: "intermediate",
  },
  {
    id: "socratic",
    emoji: "❓",
    color: "bg-rose-500",
    name_en: "Socratic Prompting",
    name_ar: "التوجيه السقراطي",
    tagline_en: "Let the AI clarify before it answers",
    tagline_ar: "دع الذكاء الاصطناعي يوضّح قبل أن يجيب",
    desc_en: "Instruct the AI to ask you clarifying questions before generating the final answer. Prevents misaligned outputs when the task is complex or ambiguous.",
    desc_ar: "وجّه الذكاء الاصطناعي لطرح أسئلة توضيحية عليك قبل إنشاء الإجابة النهائية. يمنع المخرجات غير الملائمة عندما تكون المهمة معقدة أو غامضة.",
    best_for_en: ["Ambiguous briefs", "Strategic decisions", "Academic essays", "Complex plans"],
    best_for_ar: ["الملخصات الغامضة", "القرارات الاستراتيجية", "المقالات الأكاديمية", "الخطط المعقدة"],
    example_en: "Before you answer, ask me 3 targeted clarifying questions that would help you produce a better response. Then generate the final answer.",
    example_ar: "قبل أن تجيب، اطرح عليّ 3 أسئلة توضيحية مستهدفة ستساعدك على إنتاج إجابة أفضل. ثم أنشئ الإجابة النهائية.",
    complexity: "advanced",
  },
  {
    id: "critique",
    emoji: "🔍",
    color: "bg-indigo-500",
    name_en: "Critique & Improve",
    name_ar: "النقد والتحسين",
    tagline_en: "Paste existing content — get weakness analysis + improved version",
    tagline_ar: "الصق محتوى موجودًا واحصل على تحليل نقاط الضعف + نسخة محسّنة",
    desc_en: "Provide an existing prompt or AI output. The AI identifies weaknesses, missing elements, and logical gaps, then delivers an improved version with a clear rationale.",
    desc_ar: "قدّم موجِّهًا موجودًا أو مخرجات ذكاء اصطناعي. يحدّد الذكاء الاصطناعي نقاط الضعف والعناصر المفقودة والثغرات المنطقية، ثم يقدّم نسخة محسّنة مع مبرر واضح.",
    best_for_en: ["Prompt iteration", "Output improvement", "Quality assurance", "Peer review"],
    best_for_ar: ["تكرار الموجّهات", "تحسين المخرجات", "ضمان الجودة", "مراجعة الأقران"],
    example_en: "Here is my current prompt: [prompt]. Identify its top 3 weaknesses and rewrite it to be 50% more effective for a business audience.",
    example_ar: "إليك موجّهي الحالي: [الموجّه]. حدّد أبرز 3 نقاط ضعف فيه وأعِد كتابته ليكون أكثر فاعلية بنسبة 50٪ لجمهور تجاري.",
    complexity: "advanced",
  },
  {
    id: "rag",
    emoji: "📄",
    color: "bg-cyan-500",
    name_en: "RAG Prompting",
    name_ar: "التوجيه بالاسترجاع المعزَّز",
    tagline_en: "Ground the AI answer in your own documents",
    tagline_ar: "اربط إجابة الذكاء الاصطناعي بمستنداتك الخاصة",
    desc_en: "Upload or paste a document (policy, contract, lecture, research paper). The AI answers using only your source material, reducing hallucination and ensuring accuracy.",
    desc_ar: "ارفع أو الصق مستندًا (سياسة، عقد، محاضرة، ورقة بحثية). يجيب الذكاء الاصطناعي باستخدام مصدرك فقط، مما يقلل الهلوسة ويضمن الدقة.",
    best_for_en: ["Contracts", "Policy analysis", "Lecture notes", "Research papers", "SOPs"],
    best_for_ar: ["العقود", "تحليل السياسات", "ملاحظات المحاضرات", "الأوراق البحثية", "الإجراءات التشغيلية"],
    example_en: "Using only the uploaded policy document, answer: What are the penalty clauses for late delivery, and under which conditions are they waived?",
    example_ar: "باستخدام وثيقة السياسة المُحمَّلة فقط، أجب: ما هي بنود الغرامة على التأخر في التسليم، وفي أي ظروف يُتنازَل عنها؟",
    complexity: "advanced",
  },
];

/**
 * Auto-recommend the best prompt method based on the raw text and intent.
 */
export function recommendMethod(rawText: string, intent?: string): MethodId {
  const text = rawText.toLowerCase();

  // RAG signals
  if (/\b(contract|policy|document|clause|article|section|uploaded|attached|pdf|lecture|sop)\b/.test(text)) return "rag";

  // Critique signals
  if (/\b(improve|critique|fix|wrong|weak|rewrite|review|check this prompt|here is my prompt)\b/.test(text)) return "critique";

  // Chain signals
  if (/\b(step.?by.?step|first.*then|sequence|multi.?stage|break.*into|workflow|process)\b/.test(text)) return "chain";

  // Structured / complex analysis
  if (intent === "analysis" || intent === "report" || /\b(analyze|strategic|board|executive|risk|assessment)\b/.test(text)) return "structured";

  // Role signals
  if (/\b(as a|act as|you are|expert|consultant|advisor|analyst|reviewer)\b/.test(text)) return "role";

  // Few-shot signals
  if (/\b(example|for instance|like this|pattern|classify|label|style)\b/.test(text)) return "few_shot";

  // Meta signals
  if (/\b(help me write|don.t know how|best prompt|optimal prompt|generate.*prompt)\b/.test(text)) return "meta";

  // Socratic signals
  if (/\b(not sure|ambiguous|unclear|help me figure|open.ended)\b/.test(text)) return "socratic";

  // Simple tasks
  if (intent === "writing" || intent === "creative") return "craft";
  if (intent === "coding" || intent === "software") return "task";

  return "craft";
}

export function getMethod(id: MethodId): PromptMethod {
  return PROMPT_METHODS.find((m) => m.id === id) ?? PROMPT_METHODS[0];
}

export const COMPLEXITY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
