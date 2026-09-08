/**
 * Boardroom template registry.
 *
 * Each template ships with a real, opinionated slide outline (title +
 * one-line purpose), a recommended presentation_mode preset, a target
 * slide count, and a cover tone for the gallery thumbnail. The Templates
 * gallery renders thumbnails directly from this registry, and the wizard
 * uses the same data to pre-fill the brief when a user clicks "Use".
 *
 * No fabricated stats here — these are STRUCTURES, not claims about the
 * world. Every template is rooted in a recognised consulting/boardroom
 * narrative pattern (Pyramid, SCQA, RACI, OKR, PESTEL).
 */

export type TemplateOutlineSlide = {
  titleEn: string;
  titleAr: string;
  purposeEn: string;
  purposeAr: string;
};

export type Template = {
  code: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  framework: "Pyramid" | "SCQA" | "RACI" | "OKR" | "PESTEL";
  presentationMode: string;
  defaultSlides: number;
  defaultDurationMin: number;
  tone: "orange" | "green" | "purple" | "blue" | "ink" | "lime" | "steel" | "violet" | "cyan";
  /** Real, ordered outline that ships with this template. */
  outline: TemplateOutlineSlide[];
};

const COVER_PURPOSE = {
  en: "Set the scene and frame the decision in one screen.",
  ar: "تأطير السياق وتمهيد القرار في شاشة واحدة.",
};
const DECISION_PURPOSE = {
  en: "State what the board is being asked to approve, in one sentence.",
  ar: "اذكر ما يُطلب من المجلس اعتماده بجملة واحدة.",
};
const NEXT_PURPOSE = {
  en: "Owner, action, and due date for each next step.",
  ar: "المسؤول، الإجراء، والموعد لكل خطوة تالية.",
};

export const TEMPLATES: Template[] = [
  {
    code: "boardroom_decision",
    nameEn: "Boardroom Decision",
    nameAr: "قرار مجلس الإدارة",
    taglineEn: "Recommendation-first deck for executive approvals.",
    taglineAr: "عرض يبدأ بالتوصية لاعتماد المجلس.",
    framework: "Pyramid",
    presentationMode: "corporate_boardroom",
    defaultSlides: 12,
    defaultDurationMin: 25,
    tone: "green",
    outline: [
      { titleEn: "Cover & Context", titleAr: "الغلاف والسياق", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Recommendation", titleAr: "التوصية", purposeEn: "Lead with the recommended option in one sentence.", purposeAr: "ابدأ بالتوصية في جملة واحدة." },
      { titleEn: "Why this option (3 reasons)", titleAr: "لماذا هذا الخيار (٣ مبرّرات)", purposeEn: "Three pyramid-style supporting arguments.", purposeAr: "ثلاثة مبرّرات على نسق الهرم." },
      { titleEn: "Current Situation", titleAr: "الوضع الحالي", purposeEn: "Where we are today, supported by evidence.", purposeAr: "أين نحن الآن، مدعومًا بالأدلة." },
      { titleEn: "Options Considered", titleAr: "الخيارات المدروسة", purposeEn: "Compact comparison matrix of the options.", purposeAr: "مصفوفة مقارنة مختصرة للخيارات." },
      { titleEn: "Financial Impact", titleAr: "الأثر المالي", purposeEn: "Investment, payback, and impact on key financial metrics.", purposeAr: "الاستثمار، الاسترداد، والأثر على المؤشرات المالية." },
      { titleEn: "Risks & Mitigations", titleAr: "المخاطر والمعالجات", purposeEn: "Top residual risks with owners and treatment dates.", purposeAr: "أبرز المخاطر مع المسؤولين والمواعيد." },
      { titleEn: "Timeline", titleAr: "الجدول الزمني", purposeEn: "Phased execution plan with explicit gates.", purposeAr: "خطة تنفيذ مرحلية مع بوابات قرار." },
      { titleEn: "Stakeholders", titleAr: "أصحاب المصلحة", purposeEn: "Who needs to be informed, consulted, and aligned.", purposeAr: "من يُعلَم، يُستشار، ويُوائَم." },
      { titleEn: "Quality & Compliance", titleAr: "الجودة والامتثال", purposeEn: "Controls and compliance posture before go-live.", purposeAr: "الضوابط والامتثال قبل الانطلاق." },
      { titleEn: "Decision Required", titleAr: "القرار المطلوب", purposeEn: DECISION_PURPOSE.en, purposeAr: DECISION_PURPOSE.ar },
      { titleEn: "Next Steps", titleAr: "الخطوات التالية", purposeEn: NEXT_PURPOSE.en, purposeAr: NEXT_PURPOSE.ar },
    ],
  },
  {
    code: "scqa_brief",
    nameEn: "SCQA Executive Brief",
    nameAr: "موجز تنفيذي SCQA",
    taglineEn: "Situation, Complication, Question, Answer — McKinsey-style.",
    taglineAr: "موقف، تعقيد، سؤال، إجابة — على نسق ماكنزي.",
    framework: "SCQA",
    presentationMode: "consulting_partner",
    defaultSlides: 10,
    defaultDurationMin: 20,
    tone: "orange",
    outline: [
      { titleEn: "Cover", titleAr: "الغلاف", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Situation", titleAr: "الموقف", purposeEn: "The known, stable backdrop the audience already accepts.", purposeAr: "الخلفية المستقرة التي يسلم بها الجمهور." },
      { titleEn: "Complication", titleAr: "التعقيد", purposeEn: "The change or tension that demands attention.", purposeAr: "التغيير أو التوتر الذي يستدعي الانتباه." },
      { titleEn: "Implication", titleAr: "الانعكاس", purposeEn: "Why this complication matters for the decision-maker.", purposeAr: "لماذا يهم هذا التعقيد لمتخذ القرار." },
      { titleEn: "Question", titleAr: "السؤال", purposeEn: "The single question we owe an answer to.", purposeAr: "السؤال الوحيد الذي ندين بإجابة له." },
      { titleEn: "Answer (Recommendation)", titleAr: "الإجابة (التوصية)", purposeEn: "The answer in one sentence, owned by us.", purposeAr: "الإجابة في جملة واحدة، نتبنّاها." },
      { titleEn: "Supporting Evidence", titleAr: "الأدلة الداعمة", purposeEn: "The 2–3 strongest pieces of evidence behind the answer.", purposeAr: "أقوى ٢–٣ أدلة وراء الإجابة." },
      { titleEn: "Risks & Counter-arguments", titleAr: "المخاطر والاعتراضات", purposeEn: "Steelman the strongest counter-arguments and our response.", purposeAr: "أقوى اعتراضات محتملة وردّنا عليها." },
      { titleEn: "Decision Required", titleAr: "القرار المطلوب", purposeEn: DECISION_PURPOSE.en, purposeAr: DECISION_PURPOSE.ar },
      { titleEn: "Next Steps", titleAr: "الخطوات التالية", purposeEn: NEXT_PURPOSE.en, purposeAr: NEXT_PURPOSE.ar },
    ],
  },
  {
    code: "qbr_steering",
    nameEn: "QBR Steering",
    nameAr: "لجنة توجيه ربعية",
    taglineEn: "Quarterly status & decisions for steering committees.",
    taglineAr: "الحالة الربعية وقرارات التوجيه.",
    framework: "RACI",
    presentationMode: "project_steering",
    defaultSlides: 14,
    defaultDurationMin: 30,
    tone: "ink",
    outline: [
      { titleEn: "Cover & Quarter", titleAr: "الغلاف والربع", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Headline", titleAr: "العنوان", purposeEn: "Quarter status in one sentence.", purposeAr: "حالة الربع في جملة واحدة." },
      { titleEn: "RAG Status", titleAr: "حالة الإشارة", purposeEn: "Red/Amber/Green across workstreams.", purposeAr: "أحمر/أصفر/أخضر عبر مسارات العمل." },
      { titleEn: "KPIs vs Plan", titleAr: "المؤشّرات مقابل الخطة", purposeEn: "Top 4–6 KPIs with deltas vs plan.", purposeAr: "أبرز ٤–٦ مؤشّرات مع الانحراف عن الخطة." },
      { titleEn: "Wins this quarter", titleAr: "إنجازات الربع", purposeEn: "Concrete completed milestones.", purposeAr: "مراحل ملموسة أُنجزت." },
      { titleEn: "Slips & root causes", titleAr: "التأخّرات وأسبابها", purposeEn: "What slipped and why, no euphemisms.", purposeAr: "ما تأخّر ولماذا، دون مواربة." },
      { titleEn: "Risks & Mitigations", titleAr: "المخاطر والمعالجات", purposeEn: "Top residual risks with owners and dates.", purposeAr: "أبرز المخاطر مع المسؤولين والمواعيد." },
      { titleEn: "Issues escalated", titleAr: "القضايا المُصعَّدة", purposeEn: "What we need the steering committee to unblock.", purposeAr: "ما نحتاج من لجنة التوجيه إزالته." },
      { titleEn: "Budget & Burn", titleAr: "الموازنة والصرف", purposeEn: "Plan vs actual, forecast to year-end.", purposeAr: "المخطط مقابل الفعلي، التوقّع حتى نهاية السنة." },
      { titleEn: "Resources & RACI", titleAr: "الموارد وRACI", purposeEn: "Owner / Accountable / Consulted / Informed grid.", purposeAr: "شبكة المسؤول/المحاسَب/المستشار/المُعلَم." },
      { titleEn: "Next Quarter Plan", titleAr: "خطة الربع القادم", purposeEn: "Top 3 outcomes targeted for the next quarter.", purposeAr: "أبرز ٣ نتائج مستهدفة للربع القادم." },
      { titleEn: "Decisions Required", titleAr: "القرارات المطلوبة", purposeEn: "Specific approvals + the unblock asks.", purposeAr: "موافقات محددة + طلبات إزالة العوائق." },
      { titleEn: "Next Steps", titleAr: "الخطوات التالية", purposeEn: NEXT_PURPOSE.en, purposeAr: NEXT_PURPOSE.ar },
      { titleEn: "Appendix", titleAr: "ملحقات", purposeEn: "Backup evidence + assumption log.", purposeAr: "أدلة داعمة + سجلّ الافتراضات." },
    ],
  },
  {
    code: "investor_business_case",
    nameEn: "Investor Business Case",
    nameAr: "حالة عمل للمستثمرين",
    taglineEn: "Numbers, narrative, ask. Built for board investors.",
    taglineAr: "الأرقام والسرد والطلب، لمستثمري المجالس.",
    framework: "Pyramid",
    presentationMode: "investor_business_case",
    defaultSlides: 14,
    defaultDurationMin: 25,
    tone: "purple",
    outline: [
      { titleEn: "Cover", titleAr: "الغلاف", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "The Ask", titleAr: "الطلب", purposeEn: "Capital, terms, and what it unlocks — in one sentence.", purposeAr: "رأس المال، الشروط، وما يُتيحه — في جملة واحدة." },
      { titleEn: "Problem & Why Now", titleAr: "المشكلة ولماذا الآن", purposeEn: "The unmet need and the timing thesis.", purposeAr: "الحاجة غير المُلبّاة وحجّة التوقيت." },
      { titleEn: "Solution & Differentiator", titleAr: "الحل والميزة", purposeEn: "What we built and why it's defensible.", purposeAr: "ما بنيناه ولماذا يصعب نسخه." },
      { titleEn: "Market & Wedge", titleAr: "السوق ونقطة الدخول", purposeEn: "TAM/SAM/SOM with a defensible beachhead.", purposeAr: "TAM/SAM/SOM مع نقطة دخول قابلة للدفاع." },
      { titleEn: "Traction", titleAr: "النموّ والاعتماد", purposeEn: "Hard numbers — usage, revenue, retention, growth.", purposeAr: "أرقام صلبة — الاستخدام، الإيرادات، الاحتفاظ، النموّ." },
      { titleEn: "Business Model", titleAr: "نموذج العمل", purposeEn: "Pricing, channels, gross margin, expansion path.", purposeAr: "التسعير، القنوات، الهامش، مسار التوسّع." },
      { titleEn: "Competition", titleAr: "المنافسة", purposeEn: "Honest landscape and our unfair advantage.", purposeAr: "خريطة صادقة وميزتنا غير العادلة." },
      { titleEn: "Financials", titleAr: "البيانات المالية", purposeEn: "P&L summary, unit economics, 3-yr forecast.", purposeAr: "ملخّص الأرباح والخسائر، اقتصاديات الوحدة، توقّع ٣ سنوات." },
      { titleEn: "Use of Funds", titleAr: "استخدام رأس المال", purposeEn: "Where the money goes and what it unlocks.", purposeAr: "أين تذهب الأموال وماذا تُحرّر." },
      { titleEn: "Team", titleAr: "الفريق", purposeEn: "Why this team will win this market.", purposeAr: "لماذا سينتصر هذا الفريق في هذا السوق." },
      { titleEn: "Risks & Mitigations", titleAr: "المخاطر والمعالجات", purposeEn: "Top risks named, with mitigations.", purposeAr: "أبرز المخاطر مذكورة، مع معالجات." },
      { titleEn: "Decision Required", titleAr: "القرار المطلوب", purposeEn: DECISION_PURPOSE.en, purposeAr: DECISION_PURPOSE.ar },
      { titleEn: "Next Steps", titleAr: "الخطوات التالية", purposeEn: NEXT_PURPOSE.en, purposeAr: NEXT_PURPOSE.ar },
    ],
  },
  {
    code: "okr_review",
    nameEn: "OKR Review",
    nameAr: "مراجعة OKR",
    taglineEn: "Objectives + key results, with traffic-light scoring.",
    taglineAr: "الأهداف والنتائج الأساسية بإشارات حالة.",
    framework: "OKR",
    presentationMode: "kpi_dashboard",
    defaultSlides: 9,
    defaultDurationMin: 20,
    tone: "lime",
    outline: [
      { titleEn: "Cover & Period", titleAr: "الغلاف والفترة", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Headline", titleAr: "العنوان", purposeEn: "Overall OKR posture in one sentence.", purposeAr: "وضع OKR العام في جملة واحدة." },
      { titleEn: "Objective 1 — KRs", titleAr: "الهدف ١ — النتائج الأساسية", purposeEn: "KRs with 0.0–1.0 score and trend.", purposeAr: "النتائج الأساسية بدرجة ٠٫٠–١٫٠ والاتجاه." },
      { titleEn: "Objective 2 — KRs", titleAr: "الهدف ٢ — النتائج الأساسية", purposeEn: "KRs with score and what's blocking.", purposeAr: "النتائج الأساسية مع الدرجة والعوائق." },
      { titleEn: "Objective 3 — KRs", titleAr: "الهدف ٣ — النتائج الأساسية", purposeEn: "KRs with score and lessons.", purposeAr: "النتائج الأساسية مع الدرجة والدروس." },
      { titleEn: "What worked / didn't", titleAr: "ما نجح وما لم ينجح", purposeEn: "Honest retro across the three objectives.", purposeAr: "مراجعة صريحة عبر الأهداف الثلاثة." },
      { titleEn: "Next-period Objectives", titleAr: "أهداف الفترة القادمة", purposeEn: "Proposed objectives for the upcoming period.", purposeAr: "الأهداف المقترحة للفترة القادمة." },
      { titleEn: "Decisions Required", titleAr: "القرارات المطلوبة", purposeEn: "Approvals + resourcing decisions.", purposeAr: "الموافقات وقرارات الموارد." },
      { titleEn: "Next Steps", titleAr: "الخطوات التالية", purposeEn: NEXT_PURPOSE.en, purposeAr: NEXT_PURPOSE.ar },
    ],
  },
  {
    code: "pestel_strategy",
    nameEn: "PESTEL Strategy",
    nameAr: "استراتيجية PESTEL",
    taglineEn: "Macro analysis to guide multi-year strategy.",
    taglineAr: "تحليل كلّي لتوجيه استراتيجية متعددة السنوات.",
    framework: "PESTEL",
    presentationMode: "strategy_deck",
    defaultSlides: 11,
    defaultDurationMin: 30,
    tone: "violet",
    outline: [
      { titleEn: "Cover & Horizon", titleAr: "الغلاف والأفق الزمني", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Headline & Thesis", titleAr: "العنوان والأطروحة", purposeEn: "Strategic posture in one sentence.", purposeAr: "الموقف الاستراتيجي في جملة واحدة." },
      { titleEn: "Political", titleAr: "سياسي", purposeEn: "Policy and regulatory shifts that change the playing field.", purposeAr: "التحوّلات السياسية والتنظيمية التي تُغيّر الملعب." },
      { titleEn: "Economic", titleAr: "اقتصادي", purposeEn: "Macro trends moving cost, demand, and capital.", purposeAr: "اتجاهات تُحرّك التكلفة والطلب ورأس المال." },
      { titleEn: "Social", titleAr: "اجتماعي", purposeEn: "Demographic and cultural shifts in the customer base.", purposeAr: "التحوّلات الديموغرافية والثقافية في قاعدة العملاء." },
      { titleEn: "Technological", titleAr: "تقني", purposeEn: "Tech shifts that reshape moats or open new ones.", purposeAr: "تحوّلات تقنية تُعيد تشكيل الحواجز التنافسية." },
      { titleEn: "Environmental", titleAr: "بيئي", purposeEn: "Sustainability and climate factors shaping operations.", purposeAr: "عوامل الاستدامة والمناخ التي تُشكّل العمليات." },
      { titleEn: "Legal", titleAr: "قانوني", purposeEn: "Compliance, data, and licensing constraints.", purposeAr: "الامتثال والبيانات وقيود الترخيص." },
      { titleEn: "Strategic Options", titleAr: "الخيارات الاستراتيجية", purposeEn: "Where to play, how to win, given the landscape.", purposeAr: "أين نلعب وكيف ننتصر بالنظر للمشهد." },
      { titleEn: "Decision Required", titleAr: "القرار المطلوب", purposeEn: DECISION_PURPOSE.en, purposeAr: DECISION_PURPOSE.ar },
      { titleEn: "Next Steps", titleAr: "الخطوات التالية", purposeEn: NEXT_PURPOSE.en, purposeAr: NEXT_PURPOSE.ar },
    ],
  },
  {
    code: "uae_gov_committee",
    nameEn: "Government Committee",
    nameAr: "لجنة حكومية",
    taglineEn: "Bilingual EN/AR layout, formal corporate Arabic, mirrored visuals.",
    taglineAr: "تخطيط ثنائي اللغة، عربية مؤسسية، مخططات معكوسة.",
    framework: "Pyramid",
    presentationMode: "government_boardroom",
    defaultSlides: 12,
    defaultDurationMin: 25,
    tone: "steel",
    outline: [
      { titleEn: "Cover & Mandate", titleAr: "الغلاف والاختصاص", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Recommendation", titleAr: "التوصية", purposeEn: "Lead with the recommended decision.", purposeAr: "ابدأ بالتوصية." },
      { titleEn: "Strategic Alignment", titleAr: "المواءمة الاستراتيجية", purposeEn: "How this aligns to the entity's strategy.", purposeAr: "كيف يتسق هذا مع استراتيجية الجهة." },
      { titleEn: "Current Status", titleAr: "الوضع الحالي", purposeEn: "Today, supported by evidence.", purposeAr: "الوضع اليوم، مدعومًا بالأدلة." },
      { titleEn: "Customer Happiness Impact", titleAr: "أثر إسعاد المتعاملين", purposeEn: "How customers/citizens are affected.", purposeAr: "كيف يتأثر المتعاملون/المواطنون." },
      { titleEn: "Operational Continuity", titleAr: "استمرارية التشغيل", purposeEn: "Continuity controls and contingency posture.", purposeAr: "ضوابط الاستمرارية وخطط الطوارئ." },
      { titleEn: "Risks & Mitigations", titleAr: "المخاطر والمعالجات", purposeEn: "Residual risks with owners and dates.", purposeAr: "المخاطر المتبقية مع المسؤولين والمواعيد." },
      { titleEn: "Financial Impact", titleAr: "الأثر المالي", purposeEn: "Investment, payback, and budget alignment.", purposeAr: "الاستثمار، الاسترداد، والتوافق مع الموازنة." },
      { titleEn: "Timeline & Milestones", titleAr: "الجدول الزمني", purposeEn: "Phased plan with explicit gates.", purposeAr: "خطة مرحلية مع بوابات قرار." },
      { titleEn: "Compliance & Audit", titleAr: "الامتثال والتدقيق", purposeEn: "Compliance posture and audit trail.", purposeAr: "وضع الامتثال وسجلّ التدقيق." },
      { titleEn: "Decision Required", titleAr: "القرار المطلوب", purposeEn: DECISION_PURPOSE.en, purposeAr: DECISION_PURPOSE.ar },
      { titleEn: "Next Steps", titleAr: "الخطوات التالية", purposeEn: NEXT_PURPOSE.en, purposeAr: NEXT_PURPOSE.ar },
    ],
  },
  {
    code: "training_bilingual",
    nameEn: "Training Module",
    nameAr: "وحدة تدريبية",
    taglineEn: "Learner-friendly bilingual training with bilingual notes.",
    taglineAr: "تدريب ثنائي اللغة مع ملاحظات للمتدرب.",
    framework: "SCQA",
    presentationMode: "training",
    defaultSlides: 16,
    defaultDurationMin: 45,
    tone: "cyan",
    outline: [
      { titleEn: "Cover & Learning Objectives", titleAr: "الغلاف وأهداف التعلّم", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Why this matters", titleAr: "لماذا هذا مهم", purposeEn: "Concrete consequences if learners don't apply this.", purposeAr: "العواقب الملموسة إن لم يُطبَّق هذا." },
      { titleEn: "Core concept 1", titleAr: "المفهوم الأساسي ١", purposeEn: "First teachable building block.", purposeAr: "أول لبنة قابلة للتعليم." },
      { titleEn: "Worked example 1", titleAr: "مثال محلول ١", purposeEn: "Walk through a real example end-to-end.", purposeAr: "مثال واقعي من البداية للنهاية." },
      { titleEn: "Core concept 2", titleAr: "المفهوم الأساسي ٢", purposeEn: "Second teachable building block.", purposeAr: "ثاني لبنة قابلة للتعليم." },
      { titleEn: "Worked example 2", titleAr: "مثال محلول ٢", purposeEn: "Apply concept 2 to a different scenario.", purposeAr: "تطبيق المفهوم ٢ على سيناريو مختلف." },
      { titleEn: "Common mistakes", titleAr: "الأخطاء الشائعة", purposeEn: "What learners typically get wrong, and why.", purposeAr: "ما يخطئ فيه المتدرّبون عادةً ولماذا." },
      { titleEn: "Decision tree", titleAr: "شجرة القرار", purposeEn: "When to apply which concept.", purposeAr: "متى نطبق أي مفهوم." },
      { titleEn: "Practice exercise", titleAr: "تمرين تطبيقي", purposeEn: "Hands-on exercise with a clear answer key.", purposeAr: "تمرين عملي بإجابات واضحة." },
      { titleEn: "Discussion questions", titleAr: "أسئلة للنقاش", purposeEn: "3 prompts to anchor a 10-minute discussion.", purposeAr: "٣ محاور لنقاش لمدة ١٠ دقائق." },
      { titleEn: "Mini-quiz", titleAr: "اختبار قصير", purposeEn: "5–8 questions covering the main concepts.", purposeAr: "٥–٨ أسئلة تغطي المفاهيم الأساسية." },
      { titleEn: "Recap & key takeaways", titleAr: "الخلاصة والمستفاد", purposeEn: "What to remember after the session.", purposeAr: "ما يجب تذكّره بعد الجلسة." },
      { titleEn: "Apply this week", titleAr: "طبّقه هذا الأسبوع", purposeEn: "One concrete action each learner takes within 5 days.", purposeAr: "إجراء ملموس واحد يتخذه كل متدرّب خلال ٥ أيام." },
      { titleEn: "Further reading", titleAr: "قراءات إضافية", purposeEn: "Curated next-step resources.", purposeAr: "مصادر منظّمة للخطوة التالية." },
      { titleEn: "Glossary", titleAr: "المصطلحات", purposeEn: "Bilingual terms used in this module.", purposeAr: "المصطلحات ثنائية اللغة المستخدمة في الوحدة." },
      { titleEn: "Feedback", titleAr: "التغذية الراجعة", purposeEn: "How learners can give feedback to improve the module.", purposeAr: "كيف يقدّم المتدرّبون تغذية راجعة لتحسين الوحدة." },
    ],
  },
  {
    code: "tender_response",
    nameEn: "Tender Response",
    nameAr: "ردّ على عطاء",
    taglineEn: "Bid methodology + commercial answer.",
    taglineAr: "منهجية العرض الفني والإجابة التجارية.",
    framework: "Pyramid",
    presentationMode: "tender_proposal",
    defaultSlides: 18,
    defaultDurationMin: 40,
    tone: "blue",
    outline: [
      { titleEn: "Cover & Tender Reference", titleAr: "الغلاف ومرجع العطاء", purposeEn: COVER_PURPOSE.en, purposeAr: COVER_PURPOSE.ar },
      { titleEn: "Executive Summary", titleAr: "الملخّص التنفيذي", purposeEn: "Why us, in one screen.", purposeAr: "لماذا نحن، في شاشة واحدة." },
      { titleEn: "Understanding the Requirement", titleAr: "فهم الاحتياج", purposeEn: "Mirror the requirement back in our own words.", purposeAr: "إعادة صياغة الاحتياج بكلماتنا." },
      { titleEn: "Proposed Solution", titleAr: "الحل المقترح", purposeEn: "How we'll deliver, end-to-end.", purposeAr: "كيف سننفّذ من البداية للنهاية." },
      { titleEn: "Methodology", titleAr: "المنهجية", purposeEn: "Phased approach with named deliverables.", purposeAr: "نهج مرحلي مع مخرجات مسمّاة." },
      { titleEn: "Team & Roles", titleAr: "الفريق والأدوار", purposeEn: "Named experts, time commitments, RACI.", purposeAr: "خبراء مسمّون، التزامات زمنية، RACI." },
      { titleEn: "Timeline & Milestones", titleAr: "الجدول الزمني والمراحل", purposeEn: "Phased delivery with explicit gates.", purposeAr: "تسليم مرحلي مع بوابات قرار." },
      { titleEn: "Quality & Governance", titleAr: "الجودة والحوكمة", purposeEn: "Quality controls, reviews, escalation paths.", purposeAr: "ضوابط الجودة والمراجعات وآليات التصعيد." },
      { titleEn: "Past Experience", titleAr: "الخبرات السابقة", purposeEn: "3 directly relevant references.", purposeAr: "٣ مراجع ذات صلة مباشرة." },
      { titleEn: "Local Content", titleAr: "المحتوى المحلي", purposeEn: "Local capability and economic contribution.", purposeAr: "القدرة المحلية والمساهمة الاقتصادية." },
      { titleEn: "Risk Management", titleAr: "إدارة المخاطر", purposeEn: "Top risks with treatment owners and dates.", purposeAr: "أبرز المخاطر مع المسؤولين والمواعيد." },
      { titleEn: "Compliance Matrix", titleAr: "مصفوفة الامتثال", purposeEn: "Requirement-by-requirement compliance summary.", purposeAr: "ملخّص الامتثال متطلب بمتطلب." },
      { titleEn: "Commercial Summary", titleAr: "الملخّص التجاري", purposeEn: "Price, payment terms, optionality.", purposeAr: "السعر، شروط الدفع، الخيارات." },
      { titleEn: "Pricing Detail", titleAr: "تفاصيل التسعير", purposeEn: "Line items + assumptions.", purposeAr: "البنود التفصيلية + الافتراضات." },
      { titleEn: "Acceptance Criteria", titleAr: "معايير القبول", purposeEn: "How success will be measured at handover.", purposeAr: "كيف سيُقاس النجاح عند التسليم." },
      { titleEn: "Why Us", titleAr: "لماذا نحن", purposeEn: "Three differentiators that matter for this client.", purposeAr: "ثلاثة عوامل تميّز تهم هذا العميل." },
      { titleEn: "Decision Required", titleAr: "القرار المطلوب", purposeEn: DECISION_PURPOSE.en, purposeAr: DECISION_PURPOSE.ar },
      { titleEn: "Annexes", titleAr: "ملاحق", purposeEn: "CVs, certifications, statements of capability.", purposeAr: "السير الذاتية، الشهادات، بيانات القدرات." },
    ],
  },
];

export function getTemplate(code: string): Template | undefined {
  return TEMPLATES.find((t) => t.code === code);
}
