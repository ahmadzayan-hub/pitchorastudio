/**
 * Built-in template catalog that ships with the client.
 * Lets the templates page render even when the backend is unreachable.
 */
import type { TargetModel } from "@/lib/types";

export interface BuiltinTemplate {
  id: string;
  category: "coding" | "writing" | "research" | "analysis" | "planning" | "design" | "creative";
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  sections: string[];
  starter_en: string;
  starter_ar: string;
  target_model: TargetModel;
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: "code-refactor",
    category: "coding",
    name_en: "Code refactor",
    name_ar: "إعادة هيكلة كود",
    description_en: "Refactor a function or component for clarity, performance, and tests.",
    description_ar: "أعد هيكلة دالة أو مكوّن لتحسين الوضوح والأداء والاختبارات.",
    sections: ["context", "goal", "constraints", "tests", "output"],
    starter_en: "Refactor my React data table component to be faster on large datasets.",
    starter_ar: "أعد هيكلة مكوّن جدول البيانات في React ليكون أسرع على مجموعات البيانات الكبيرة.",
    target_model: "chatgpt"
  },
  {
    id: "bug-investigation",
    category: "coding",
    name_en: "Bug investigation",
    name_ar: "تحقيق في خطأ برمجي",
    description_en: "Find the root cause of a bug and propose a minimal fix.",
    description_ar: "اكتشف السبب الجذري لخطأ برمجي واقترح حلاً بأقل تغيير.",
    sections: ["symptom", "context", "logs", "hypothesis", "fix"],
    starter_en: "My Next.js CI test fails intermittently with a timeout. Help me find the root cause.",
    starter_ar: "اختبار CI في تطبيق Next.js يفشل أحيانًا بانتهاء المهلة. ساعدني في إيجاد السبب الجذري.",
    target_model: "copilot"
  },
  {
    id: "marketing-copy",
    category: "writing",
    name_en: "Marketing copy",
    name_ar: "نسخة تسويقية",
    description_en: "Write conversion-focused marketing copy with a clear CTA.",
    description_ar: "اكتب نصًا تسويقيًا يحفّز التحويل مع دعوة عمل واضحة.",
    sections: ["audience", "value_prop", "tone", "cta"],
    starter_en: "Write a tweet to promote my indie SaaS to developers.",
    starter_ar: "اكتب تغريدة للترويج لتطبيق SaaS مستقلّ يستهدف المطوّرين.",
    target_model: "chatgpt"
  },
  {
    id: "polite-email",
    category: "writing",
    name_en: "Polite reply",
    name_ar: "ردّ مهذّب",
    description_en: "Draft a courteous, clear email reply that protects the relationship.",
    description_ar: "اكتب ردًا بريديًا مهذّبًا وواضحًا يحافظ على العلاقة المهنية.",
    sections: ["context", "tone", "next_step"],
    starter_en: "Draft a polite reply declining a meeting invitation while leaving the door open.",
    starter_ar: "اكتب ردًا مهذّبًا للاعتذار عن دعوة اجتماع مع إبقاء الباب مفتوحًا للتعاون مستقبلاً.",
    target_model: "gemini"
  },
  {
    id: "research-brief",
    category: "research",
    name_en: "Research brief",
    name_ar: "موجز بحثي",
    description_en: "Generate a structured research brief on any topic for any audience.",
    description_ar: "أنشئ موجزًا بحثيًا منظّمًا حول أي موضوع لأي جمهور.",
    sections: ["topic", "audience", "depth", "structure"],
    starter_en: "Summarize the state of vector databases for a non-technical CEO.",
    starter_ar: "لخّص حالة قواعد البيانات المتجهية لمدير تنفيذي غير تقني.",
    target_model: "claude"
  },
  {
    id: "data-analysis",
    category: "analysis",
    name_en: "Data analysis",
    name_ar: "تحليل بيانات",
    description_en: "Analyze a dataset and surface the most important insights.",
    description_ar: "حلّل مجموعة بيانات واستخرج أهم الاستنتاجات.",
    sections: ["dataset", "question", "framework", "output"],
    starter_en: "Analyze my SaaS user activity CSV and tell me which features drive retention.",
    starter_ar: "حلّل ملف نشاط مستخدمي SaaS بصيغة CSV وأخبرني ما الميزات التي تعزّز الاحتفاظ.",
    target_model: "claude"
  },
  {
    id: "launch-plan",
    category: "planning",
    name_en: "Launch plan",
    name_ar: "خطّة إطلاق",
    description_en: "Plan a phased product launch with milestones and a checklist.",
    description_ar: "خطّط لإطلاق منتج على مراحل مع علامات بارزة وقائمة مهام.",
    sections: ["timeline", "milestones", "channels", "metrics"],
    starter_en: "Plan a 4-week launch checklist for a free tier SaaS.",
    starter_ar: "ضع قائمة إطلاق مدّتها أربعة أسابيع لتطبيق SaaS بخطّة مجانية.",
    target_model: "generic"
  },
  {
    id: "logo-brief",
    category: "design",
    name_en: "Logo brief",
    name_ar: "موجز شعار",
    description_en: "Write a tight design brief for a logo or brand mark.",
    description_ar: "اكتب موجز تصميم محكمًا لشعار أو هويّة بصرية.",
    sections: ["brand", "audience", "vibe", "constraints", "deliverables"],
    starter_en: "Write a brief for a modern, trustworthy SaaS logo with a hint of magic.",
    starter_ar: "اكتب موجزًا لشعار SaaS حديث وموثوق مع لمسة من السحر.",
    target_model: "chatgpt"
  },
  {
    id: "creative-story",
    category: "creative",
    name_en: "Short story",
    name_ar: "قصّة قصيرة",
    description_en: "Outline a short story with character, conflict, and a satisfying ending.",
    description_ar: "اكتب مخطّطًا لقصّة قصيرة بشخصية وصراع ونهاية مُرضية.",
    sections: ["theme", "tone", "characters", "structure"],
    starter_en: "Write a 500-word short story about an AI that learns to apologize.",
    starter_ar: "اكتب قصّة قصيرة من 500 كلمة عن ذكاء اصطناعي يتعلّم الاعتذار.",
    target_model: "claude"
  }
];

export function categoryLabel(category: BuiltinTemplate["category"], locale: "en" | "ar") {
  const labels: Record<BuiltinTemplate["category"], { en: string; ar: string }> = {
    coding: { en: "Coding", ar: "برمجة" },
    writing: { en: "Writing", ar: "كتابة" },
    research: { en: "Research", ar: "بحث" },
    analysis: { en: "Analysis", ar: "تحليل" },
    planning: { en: "Planning", ar: "تخطيط" },
    design: { en: "Design", ar: "تصميم" },
    creative: { en: "Creative", ar: "إبداع" }
  };
  return labels[category][locale];
}
