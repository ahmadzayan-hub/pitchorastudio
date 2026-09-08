/**
 * Synthetic blueprint + slides generator for demo mode.
 *
 * No Anthropic key required. Produces a plausible boardroom blueprint
 * and a varied deck (cover, KPI, risks, decision, timeline, stakeholder
 * map, next steps) so the trial flow runs end-to-end and the resulting
 * PPTX showcases the full layout library — not just bullet lists.
 */

import type { Blueprint, EvidenceItem, Slide, SlideModel } from "../types";

type DemoInput = {
  title: string;
  audience?: string | null;
  objective?: string | null;
  decision_required?: string | null;
  target_slide_count?: number;
  language_mode?: "en" | "ar" | "bilingual";
};

const SECTION_DEFS: { titleEn: string; titleAr: string; purposeEn: string; purposeAr: string }[] = [
  { titleEn: "Cover & Context",        titleAr: "الغلاف والسياق",          purposeEn: "Set the scene and frame the decision.",                              purposeAr: "تأطير السياق وتمهيد القرار." },
  { titleEn: "Executive Summary",       titleAr: "الملخّص التنفيذي",        purposeEn: "Headline metrics and recommendation in one screen.",                  purposeAr: "أبرز المؤشّرات والتوصية في شاشة واحدة." },
  { titleEn: "Current Situation",       titleAr: "الوضع الحالي",            purposeEn: "Where we are today, supported by evidence.",                          purposeAr: "أين نحن الآن، مدعومًا بالأدلة." },
  { titleEn: "Key Risks & Mitigations", titleAr: "أبرز المخاطر والمعالجات", purposeEn: "Top residual risks with treatment owners and dates.",                 purposeAr: "أبرز المخاطر المتبقّية مع أصحابها ومواعيدها." },
  { titleEn: "Strategic Options",       titleAr: "الخيارات الاستراتيجية",   purposeEn: "Compare options on the criteria the board cares about.",              purposeAr: "مقارنة الخيارات وفق معايير المجلس." },
  { titleEn: "Recommendation",          titleAr: "التوصية",                 purposeEn: "State the recommended option and the rationale in one screen.",       purposeAr: "اذكر الخيار الموصى به والمبرّرات في شاشة واحدة." },
  { titleEn: "Financial Impact",        titleAr: "الأثر المالي",            purposeEn: "Investment, payback, and impact on key financial metrics.",           purposeAr: "الاستثمار، فترة الاسترداد، والأثر على المؤشّرات المالية." },
  { titleEn: "Timeline & Milestones",   titleAr: "الجدول الزمني والمراحل",  purposeEn: "Phased execution plan with explicit gates.",                          purposeAr: "خطة تنفيذ مرحلية مع بوابات قرار واضحة." },
  { titleEn: "Stakeholder Map",         titleAr: "خارطة أصحاب المصلحة",     purposeEn: "Who needs to be informed, consulted, and aligned.",                   purposeAr: "من يجب إعلامه، استشارته، ومواءمته." },
  { titleEn: "Quality & Compliance",    titleAr: "الجودة والامتثال",        purposeEn: "Quality controls and compliance posture before go-live.",             purposeAr: "ضوابط الجودة والامتثال قبل الانطلاق." },
  { titleEn: "Decision Required",       titleAr: "القرار المطلوب",          purposeEn: "What the board is being asked to approve, in one sentence.",          purposeAr: "ما يُطلب من المجلس اعتماده، بجملة واحدة." },
  { titleEn: "Next Steps",              titleAr: "الخطوات التالية",         purposeEn: "Owner, action, and due date for each next step.",                     purposeAr: "المسؤول، الإجراء، والموعد لكل خطوة لاحقة." },
  { titleEn: "Appendix",                titleAr: "ملحقات",                  purposeEn: "Supporting evidence and assumptions.",                                purposeAr: "أدلة داعمة وافتراضات." },
  { titleEn: "Glossary",                titleAr: "المصطلحات",               purposeEn: "Bilingual glossary for clarity.",                                     purposeAr: "مسرد ثنائي اللغة لضمان الوضوح." },
];

export function buildDemoBlueprint(input: DemoInput): Blueprint {
  const n = Math.max(6, Math.min(input.target_slide_count ?? 8, 14));
  const structure: Blueprint["recommended_structure"] = [];
  for (let i = 0; i < n; i++) {
    const def = SECTION_DEFS[i] ?? SECTION_DEFS[SECTION_DEFS.length - 1];
    structure.push({
      slide_number: i + 1,
      title: def.titleEn,
      purpose:
        i === 0
          ? "Set the scene and frame the decision."
          : i === n - 1
          ? "Close with next steps and ownership."
          : "Drive the audience toward the recommended decision.",
    });
  }
  return {
    objective: input.objective ?? "Brief the executive committee and obtain a clear decision.",
    audience_logic: `Audience is ${input.audience ?? "executive director"}. Lead with decision, support with evidence.`,
    key_message:
      "Recommend a single, action-oriented option grounded in evidence; flag residual risk and ask for approval to proceed.",
    storyline: [
      "Frame: where we are now.",
      "What changed and why it matters.",
      "Options considered and trade-offs.",
      "Recommended option + rationale.",
      "What we need from the board.",
    ],
    recommended_structure: structure,
    missing_data: [
      "Confirmed financial baseline (Q3 actuals)",
      "Latest risk register (post-incident updates)",
      "Vendor SLA breach evidence (if any)",
    ],
  };
}

// ── Per-slide content models ──────────────────────────────────────────

function contentForSection(titleEn: string, allTitles: string[], totalSlides: number, slideIndex: number, deckTitle: string, keyMessage: string): SlideModel {
  const isLast = slideIndex === totalSlides - 1;

  if (slideIndex === 0) {
    return {
      kind: "cover",
      title: deckTitle,
      subtitle: keyMessage,
      date: new Date().toISOString().slice(0, 10),
    };
  }
  if (titleEn === "Executive Summary") {
    return {
      kind: "kpi",
      cards: [
        { label: "On-track",     value: "78%", delta: "+6 pp QoQ" },
        { label: "At-risk",      value: "14%", delta: "-3 pp QoQ" },
        { label: "Off-track",    value: "8%",  delta: "-3 pp QoQ" },
        { label: "Capex needed", value: "AED 4.8M" },
      ],
    } as SlideModel;
  }
  if (titleEn === "Current Situation") {
    return {
      kind: "bullets",
      bullets: [
        "Q3 portfolio results: 78% on-track, 14% at risk, 8% off-track.",
        "Two SLA breaches recorded this quarter, both contained within 24h.",
        "Customer NPS holding at +42; brand impact within tolerance.",
        "Operational cost trending +3% above plan, driven by reactive maintenance.",
      ],
    } as SlideModel;
  }
  if (titleEn === "Key Risks & Mitigations") {
    return {
      kind: "table",
      headers: ["Risk", "Likelihood", "Impact", "Owner", "Treatment"],
      rows: [
        ["Vendor SLA breach", "Medium", "High",     "COO",  "Predictive analytics + monthly review"],
        ["Capex slippage",    "Low",    "High",     "CFO",  "Quarterly stage-gate"],
        ["Talent attrition",  "Medium", "Medium",   "CHRO", "Retention bonus + succession plan"],
        ["Cyber exposure",    "Low",    "Critical", "CISO", "Patch SLA <24h + tabletop drill"],
      ],
    } as SlideModel;
  }
  if (titleEn === "Strategic Options") {
    return {
      kind: "matrix",
      cols: ["Option A", "Option B", "Option C"],
      rows: ["Risk reduction", "Cost", "Time to value", "Stakeholder buy-in"],
      cells: [
        ["Low",  "High", "Medium"],
        ["Low",  "Mid",  "High"  ],
        ["Slow", "Fast", "Mid"   ],
        ["Mid",  "High", "Mid"   ],
      ],
    } as SlideModel;
  }
  if (titleEn === "Recommendation") {
    return {
      kind: "decision",
      recommendation: "Approve Option B — accelerated maintenance and predictive analytics rollout.",
      rationale: [
        "Lowest residual risk profile of the three options evaluated.",
        "Strong evidence baseline from internal incident data and supplier SLAs.",
        "Aligned with strategic direction and CFO cost-discipline guidance.",
        "Payback in 7 months; stage-gated to control execution risk.",
      ],
    } as SlideModel;
  }
  if (titleEn === "Financial Impact") {
    return {
      kind: "chart",
      spec: {
        kind: "column",
        title: "Cumulative net benefit (AED M)",
        categories: ["Y0", "Y1", "Y2", "Y3"],
        series: [
          { name: "Investment", values: [-4.8, -1.2, -0.4, -0.2] },
          { name: "Benefit",    values: [ 0.0,  3.1,  4.6,  5.4] },
          { name: "Net",        values: [-4.8,  1.9,  4.2,  5.2] },
        ],
        showLegend: true,
      },
    } as SlideModel;
  }
  if (titleEn === "Timeline & Milestones") {
    return {
      kind: "timeline",
      milestones: [
        { date: "M0", label: "Mobilise programme team",       status: "now" },
        { date: "M1", label: "Vendor onboarding complete",    status: "next" },
        { date: "M3", label: "Pilot site live",               status: "next" },
        { date: "M6", label: "Roll-out to all sites",         status: "next" },
        { date: "M9", label: "Stage-gate review with board",  status: "next" },
      ],
    } as SlideModel;
  }
  if (titleEn === "Stakeholder Map") {
    return {
      kind: "stakeholder_map",
      quadrants: {
        high_high: ["Board",   "CFO",  "COO"],
        high_low:  ["CHRO",    "CISO"],
        low_high:  ["Vendors", "Auditors"],
        low_low:   ["End users (read-only)"],
      },
    } as SlideModel;
  }
  if (titleEn === "Quality & Compliance") {
    return {
      kind: "bullets",
      bullets: [
        "ISO 9001 audit scheduled for Q4 — gap-list closed.",
        "Data residency: all PII processing remains in-region.",
        "Change-advisory board approval obtained for go-live window.",
        "Penetration test passed; remediations tracked in PMO.",
      ],
    } as SlideModel;
  }
  if (titleEn === "Decision Required" || isLast) {
    return {
      kind: "next_steps",
      actions: [
        { owner: "COO",  due: "+14d", action: "Mobilise programme team and PMO." },
        { owner: "CFO",  due: "+21d", action: "Confirm capex allocation and reporting." },
        { owner: "Risk", due: "+30d", action: "Refresh risk register and assurance plan." },
        { owner: "CISO", due: "+45d", action: "Run go-live readiness tabletop drill." },
      ],
    } as SlideModel;
  }
  // Fallback for Appendix / Glossary / unknown sections
  return {
    kind: "bullets",
    bullets: [
      `${titleEn}: see supporting evidence in appendix.`,
      "Owner and timeline tracked in PMO.",
      "Assumptions reviewed with the relevant function.",
    ],
  } as SlideModel;
}

const KEY_MSG_EN: Record<string, string> = {
  "Cover & Context":        "From raw context to a board-ready decision.",
  "Executive Summary":      "Recommend Option B; payback in 7 months; risk profile improves.",
  "Current Situation":      "Portfolio is mostly on-track; cost pressure rising on reactive maintenance.",
  "Key Risks & Mitigations":"Top four risks have named owners and time-bound treatments.",
  "Strategic Options":      "Option B leads on risk reduction and time-to-value.",
  "Recommendation":         "Approve Option B with stage-gated execution.",
  "Financial Impact":       "Net benefit positive from Y2; payback in 7 months.",
  "Timeline & Milestones":  "Phased rollout with a 9-month board stage-gate.",
  "Stakeholder Map":        "Board, CFO and COO are the high-influence high-interest quadrant.",
  "Quality & Compliance":   "Audit-ready; no open critical findings.",
  "Decision Required":      "Approval to proceed with Option B and quarterly review cadence.",
  "Next Steps":             "Mobilise this fortnight; first stage-gate at month three.",
  "Appendix":               "Supporting evidence and assumptions.",
  "Glossary":               "Bilingual glossary for clarity.",
};

const KEY_MSG_AR: Record<string, string> = {
  "Cover & Context":        "من السياق الخام إلى قرار جاهز للمجلس.",
  "Executive Summary":      "نوصي بالخيار «ب»؛ استرداد خلال 7 أشهر، وتحسّن المخاطر.",
  "Current Situation":      "المحفظة في معظمها ضمن المسار، مع ضغط تكلفة بسبب الصيانة التفاعلية.",
  "Key Risks & Mitigations":"أبرز أربع مخاطر بمسؤولين محدّدين ومعالجات بمواعيد.",
  "Strategic Options":      "يتقدّم الخيار «ب» في خفض المخاطر وسرعة تحقّق القيمة.",
  "Recommendation":         "اعتماد الخيار «ب» مع تنفيذ مرحلي ببوابات قرار.",
  "Financial Impact":       "صافي المنفعة موجب من السنة الثانية؛ الاسترداد خلال 7 أشهر.",
  "Timeline & Milestones":  "تنفيذ مرحلي مع بوابة قرار للمجلس في الشهر التاسع.",
  "Stakeholder Map":        "المجلس والمدير المالي والتشغيلي في ربع التأثير والاهتمام العالي.",
  "Quality & Compliance":   "جاهز للتدقيق؛ لا توجد ملاحظات حرجة مفتوحة.",
  "Decision Required":      "اعتماد المضي بالخيار «ب» ومراجعة ربعية.",
  "Next Steps":             "حشد الفريق خلال أسبوعين؛ أول بوابة قرار في الشهر الثالث.",
  "Appendix":               "أدلة داعمة وافتراضات.",
  "Glossary":               "مسرد ثنائي اللغة لضمان الوضوح.",
};

const NOTES_EN: Record<string, string> = {
  "Cover & Context":         "Open with the decision frame, not the agenda. State why this is on the board's table today.",
  "Executive Summary":       "Lead with the recommendation. Use the four cards to anchor the headline metrics.",
  "Current Situation":       "Walk through the four bullets in order; pause on cost pressure.",
  "Key Risks & Mitigations": "Top four residual risks. Owner and treatment date are non-negotiable.",
  "Strategic Options":       "Read the matrix down each option, not across criteria.",
  "Recommendation":          "Make the recommendation in one sentence, then the four rationale points.",
  "Financial Impact":        "Net benefit turns positive in Y2; payback in 7 months.",
  "Timeline & Milestones":   "Five milestones; one decision gate at month nine.",
  "Stakeholder Map":         "High-high quadrant is where active alignment is needed before go-live.",
  "Quality & Compliance":    "Confirm there are no open critical findings before asking for approval.",
  "Decision Required":       "Ask for the decision in one sentence; do not list options again.",
  "Next Steps":              "Owner, action, due date — read each row.",
};

const NOTES_AR: Record<string, string> = {
  "Cover & Context":         "ابدأ بإطار القرار لا بجدول الأعمال. أوضح لماذا الموضوع أمام المجلس اليوم.",
  "Executive Summary":       "اطرح التوصية أولًا، ثم استخدم البطاقات الأربع لتأطير المؤشّرات.",
  "Current Situation":       "اعرض النقاط الأربع بالترتيب، وقف عند ضغط التكلفة.",
  "Key Risks & Mitigations": "أبرز أربع مخاطر متبقّية. تحديد المسؤول وموعد المعالجة شرط لا تنازل عنه.",
  "Strategic Options":       "اقرأ المصفوفة عموديًا لكل خيار، لا أفقيًا عبر المعايير.",
  "Recommendation":          "اطرح التوصية بجملة واحدة، ثم النقاط الأربع للمبرّرات.",
  "Financial Impact":        "صافي المنفعة يصبح موجبًا في السنة الثانية؛ الاسترداد خلال 7 أشهر.",
  "Timeline & Milestones":   "خمس مراحل، وبوابة قرار واحدة في الشهر التاسع.",
  "Stakeholder Map":         "ربع «تأثير عالٍ–اهتمام عالٍ» هو الذي يحتاج مواءمة فعلية قبل الانطلاق.",
  "Quality & Compliance":    "تأكّد من خلوّ السجل من ملاحظات حرجة قبل طلب الاعتماد.",
  "Decision Required":       "اطلب القرار بجملة واحدة، ولا تُعِد سرد الخيارات.",
  "Next Steps":              "المسؤول، الإجراء، والموعد — اقرأ كل صف.",
};

// Evidence references attached to each section. Slides that don't need
// citations (cover, decision, next_steps, stakeholder map) get an empty
// list — the quality engine treats those as exempt.
const EVIDENCE_REFS: Record<string, string[]> = {
  "Cover & Context":         [],
  "Executive Summary":       ["e-q3-portfolio", "e-capex-baseline", "e-nps-q3"],
  "Current Situation":       ["e-q3-portfolio", "e-sla-breach-log", "e-nps-q3", "e-opex-trend"],
  "Key Risks & Mitigations": ["e-risk-register", "e-sla-breach-log", "e-cyber-pen-test"],
  "Strategic Options":       ["e-options-tradeoff", "e-finance-model"],
  "Recommendation":          [],
  "Financial Impact":        ["e-finance-model", "e-capex-baseline"],
  "Timeline & Milestones":   ["e-pmo-plan"],
  "Stakeholder Map":         [],
  "Quality & Compliance":    ["e-iso-9001-audit", "e-cyber-pen-test", "e-cab-record"],
  "Decision Required":       [],
  "Next Steps":              [],
  "Appendix":                ["e-q3-portfolio", "e-finance-model"],
  "Glossary":                [],
};

export function buildDemoEvidence(): EvidenceItem[] {
  // 12 well-classified evidence items that map to the EVIDENCE_REFS above.
  // The mix is intentional: heavy on `fact` and `assessment`, light on
  // `input_required` — exactly what the quality engine rewards.
  const E = (id: string, claim: string, classification: EvidenceItem["classification"], confidence = 0.92): EvidenceItem => ({
    id,
    project_id: "demo",
    claim,
    classification,
    confidence,
    topic_tags: ["board", "demo"],
  });
  return [
    E("e-q3-portfolio",     "Q3 portfolio status: 78% on-track, 14% at-risk, 8% off-track.", "fact", 0.96),
    E("e-capex-baseline",   "Current capex baseline AED 4.8M, locked at FY board approval.", "fact", 0.94),
    E("e-nps-q3",           "Customer NPS held at +42 across Q3 (UAE benchmark +28).", "fact", 0.93),
    E("e-sla-breach-log",   "Two SLA breaches logged in Q3, each contained <24h.", "fact", 0.95),
    E("e-opex-trend",       "Opex tracking +3% above plan, driven by reactive maintenance.", "professional_assessment", 0.85),
    E("e-risk-register",    "Risk register refreshed Q3 with named owners on every red entry.", "fact", 0.94),
    E("e-cyber-pen-test",   "Independent penetration test passed; remediations tracked in PMO.", "fact", 0.93),
    E("e-options-tradeoff", "Options A/B/C scored on 4 boardroom criteria by COO and Risk.", "professional_assessment", 0.88),
    E("e-finance-model",    "Three-year DCF with payback < 7 months on Option B.", "professional_assessment", 0.86),
    E("e-pmo-plan",         "PMO mobilisation plan with stage-gates at M1/M3/M6/M9.", "fact", 0.91),
    E("e-iso-9001-audit",   "ISO 9001 audit gap-list closed ahead of Q4 review.", "fact", 0.94),
    E("e-cab-record",       "Change-Advisory Board approval recorded for go-live window.", "fact", 0.93),
  ];
}

export function buildDemoSlides(opts: {
  title: string;
  language_mode: "en" | "ar" | "bilingual";
  blueprint: Blueprint;
}): Slide[] {
  const { title, language_mode, blueprint } = opts;
  const wantAr = language_mode === "ar" || language_mode === "bilingual";
  const total = blueprint.recommended_structure.length;
  const allTitles = blueprint.recommended_structure.map((s) => s.title);

  return blueprint.recommended_structure.map((s, i) => {
    const def = SECTION_DEFS.find((d) => d.titleEn === s.title) ?? SECTION_DEFS[SECTION_DEFS.length - 1];
    const content = contentForSection(s.title, allTitles, total, i, title, blueprint.key_message);

    return {
      id: `demo-slide-${s.slide_number}`,
      slide_number: s.slide_number,
      title_en: def.titleEn,
      title_ar: wantAr ? def.titleAr : undefined,
      purpose: def.purposeEn,
      key_message_en: KEY_MSG_EN[def.titleEn] ?? def.purposeEn,
      key_message_ar: wantAr ? (KEY_MSG_AR[def.titleEn] ?? def.purposeAr) : undefined,
      content_json: content,
      visual_json: { layout: "boardroom", iconography: "line" },
      speaker_notes_en: NOTES_EN[def.titleEn] ?? `${def.titleEn}: drive the discussion toward the decision.`,
      speaker_notes_ar: wantAr ? (NOTES_AR[def.titleEn] ?? `${def.titleAr}: قُد النقاش نحو القرار.`) : undefined,
      status: "generated",
      animation_plan: { entrance: "fade" },
      evidence_refs: EVIDENCE_REFS[def.titleEn] ?? [],
    } as Slide;
  });
}
