"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export interface WizardAnswers {
  goal: string;
  context: string;
  audience: string;
  role: string;
  format: string;
  tone: string;
  examples: string;
  constraints: string;
  success: string;
}

interface Props {
  onComplete: (prompt: string, answers: WizardAnswers) => void;
  onClose: () => void;
}

interface Step {
  id: keyof WizardAnswers;
  emoji: string;
  label_en: string;
  label_ar: string;
  placeholder_en: string;
  placeholder_ar: string;
  hint_en: string;
  hint_ar: string;
  required: boolean;
}

const STEPS: Step[] = [
  {
    id: "goal",
    emoji: "🎯",
    label_en: "What is your goal?",
    label_ar: "ما هو هدفك؟",
    placeholder_en: "e.g. Write a strategic analysis of the UAE real estate market for Q4 2025",
    placeholder_ar: "مثال: اكتب تحليلًا استراتيجيًا لسوق العقارات الإماراتي للربع الرابع من 2025",
    hint_en: "Start with an action verb: write, analyze, summarize, create, compare…",
    hint_ar: "ابدأ بفعل إجراء: اكتب، حلّل، لخّص، أنشئ، قارن…",
    required: true,
  },
  {
    id: "context",
    emoji: "📋",
    label_en: "What is the context?",
    label_ar: "ما هو السياق؟",
    placeholder_en: "e.g. This is for a board meeting. The audience has limited technical knowledge. Budget: $2M.",
    placeholder_ar: "مثال: هذا لاجتماع مجلس الإدارة. الجمهور لديه معرفة تقنية محدودة. الميزانية: مليونا دولار.",
    hint_en: "Background, constraints, deadlines, or any relevant facts the AI should know",
    hint_ar: "الخلفية والقيود والمواعيد النهائية أو أي حقائق ذات صلة يجب أن يعرفها الذكاء الاصطناعي",
    required: false,
  },
  {
    id: "audience",
    emoji: "👥",
    label_en: "Who is the audience?",
    label_ar: "من هو الجمهور؟",
    placeholder_en: "e.g. Board of directors (CFO, CEO, non-technical), MBA students, Software engineers",
    placeholder_ar: "مثال: مجلس الإدارة (المدير المالي، المدير التنفيذي، غير تقنيين)، طلاب الماجستير، مهندسو البرمجيات",
    hint_en: "Who will read this? Their role, expertise level, and expectations",
    hint_ar: "من سيقرأ هذا؟ دوره ومستوى خبرته وتوقعاته",
    required: false,
  },
  {
    id: "role",
    emoji: "🧑‍💼",
    label_en: "What role should the AI play?",
    label_ar: "ما الدور الذي يجب أن يؤديه الذكاء الاصطناعي؟",
    placeholder_en: "e.g. Senior investment analyst, Harvard professor, GCC market expert, Legal counsel",
    placeholder_ar: "مثال: محلل استثماري أول، أستاذ جامعي، خبير في أسواق الخليج، مستشار قانوني",
    hint_en: "A specific expert role sharpens vocabulary, depth, and credibility",
    hint_ar: "دور خبير محدد يحسّن المفردات والعمق والمصداقية",
    required: false,
  },
  {
    id: "format",
    emoji: "📄",
    label_en: "What output format do you need?",
    label_ar: "ما صيغة المخرج المطلوبة؟",
    placeholder_en: "e.g. Executive summary (300 words), bullet list with 5 points, table with 3 columns",
    placeholder_ar: "مثال: ملخص تنفيذي (300 كلمة)، قائمة نقطية بـ 5 نقاط، جدول بـ 3 أعمدة",
    hint_en: "Bullet list, table, JSON, numbered steps, executive brief, email, paragraph…",
    hint_ar: "قائمة نقطية، جدول، JSON، خطوات مرقمة، ملخص تنفيذي، بريد إلكتروني، فقرة…",
    required: false,
  },
  {
    id: "tone",
    emoji: "🎭",
    label_en: "What tone should be used?",
    label_ar: "ما الأسلوب الذي يجب استخدامه؟",
    placeholder_en: "e.g. Professional and concise, Academic and rigorous, Friendly and conversational",
    placeholder_ar: "مثال: مهني وموجز، أكاديمي ودقيق، ودي وحواري",
    hint_en: "Tone affects every word the AI chooses — be specific",
    hint_ar: "الأسلوب يؤثر على كل كلمة يختارها الذكاء الاصطناعي — كن محددًا",
    required: false,
  },
  {
    id: "examples",
    emoji: "💡",
    label_en: "Any examples to guide the AI?",
    label_ar: "هل لديك أمثلة لتوجيه الذكاء الاصطناعي؟",
    placeholder_en: "e.g. Here is the style I want: [paste example output]",
    placeholder_ar: "مثال: إليك الأسلوب الذي أريده: [الصق نموذجًا]",
    hint_en: "Examples dramatically improve output quality. Even one example helps.",
    hint_ar: "الأمثلة تُحسّن جودة المخرج بشكل كبير. حتى مثال واحد يفيد.",
    required: false,
  },
  {
    id: "constraints",
    emoji: "⛔",
    label_en: "What should the AI avoid?",
    label_ar: "ماذا يجب أن يتجنب الذكاء الاصطناعي؟",
    placeholder_en: "e.g. No jargon. Max 400 words. Don't include pricing. Avoid speculation.",
    placeholder_ar: "مثال: لا مصطلحات تقنية. الحد الأقصى 400 كلمة. لا تدرج الأسعار. تجنّب التخمين.",
    hint_en: "Constraints are just as important as instructions — they prevent common mistakes",
    hint_ar: "القيود مهمة بقدر التعليمات — فهي تمنع الأخطاء الشائعة",
    required: false,
  },
  {
    id: "success",
    emoji: "✅",
    label_en: "How will you know if it succeeded?",
    label_ar: "كيف ستعرف أنه نجح؟",
    placeholder_en: "e.g. The output is useful if it can be presented to the board without editing",
    placeholder_ar: "مثال: المخرج مفيد إذا كان يمكن تقديمه لمجلس الإدارة دون تحرير",
    hint_en: "A success criterion lets the AI self-check before responding",
    hint_ar: "معيار النجاح يسمح للذكاء الاصطناعي بالتحقق من ذاته قبل الإجابة",
    required: false,
  },
];

function buildPrompt(answers: WizardAnswers, ar: boolean): string {
  const lines: string[] = [];

  if (answers.role.trim()) {
    lines.push(`${ar ? "أنت" : "You are"} ${answers.role.trim()}.\n`);
  }

  lines.push(`## ${ar ? "الهدف" : "Goal"}\n${answers.goal.trim()}\n`);

  if (answers.context.trim())
    lines.push(`## ${ar ? "السياق" : "Context"}\n${answers.context.trim()}\n`);

  if (answers.audience.trim())
    lines.push(`## ${ar ? "الجمهور" : "Audience"}\n${answers.audience.trim()}\n`);

  if (answers.examples.trim())
    lines.push(`## ${ar ? "أمثلة" : "Examples"}\n${answers.examples.trim()}\n`);

  if (answers.constraints.trim())
    lines.push(`## ${ar ? "القيود" : "Constraints"}\n${answers.constraints.trim()}\n`);

  if (answers.format.trim())
    lines.push(`## ${ar ? "صيغة المخرج" : "Output Format"}\n${answers.format.trim()}\n`);

  if (answers.tone.trim())
    lines.push(`## ${ar ? "الأسلوب" : "Tone"}\n${answers.tone.trim()}\n`);

  if (answers.success.trim())
    lines.push(`## ${ar ? "معيار النجاح" : "Success Criteria"}\n${answers.success.trim()}\n`);

  return lines.join("\n").trim();
}

export default function PromptBuilderWizard({ onComplete, onClose }: Props) {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({
    goal: "", context: "", audience: "", role: "",
    format: "", tone: "", examples: "", constraints: "", success: "",
  });

  const current = STEPS[step];
  const progress = ((step) / (STEPS.length - 1)) * 100;
  const canProceed = !current.required || answers[current.id].trim().length > 3;

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const built = buildPrompt(answers, ar);
      onComplete(built, answers);
    }
  }

  function skip() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  return (
    <div className="card border-2 border-brand-100 dark:border-brand-900/40 p-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950/40 dark:to-violet-950/30 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white text-lg" aria-hidden="true">🏗️</span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {ar ? "مُنشئ الموجِّه خطوة بخطوة" : "Prompt Builder Wizard"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ar ? `الخطوة ${step + 1} من ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 quality-bar-track">
          <div className="quality-bar-fill bg-brand-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Step dots */}
        <div className="mt-2.5 flex gap-1.5 justify-center">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={[
                "wizard-progress-dot",
                i === step ? "active" : i < step ? "done" : "pending"
              ].join(" ")}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-5 wizard-step">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl" aria-hidden="true">{current.emoji}</span>
          <label className="font-bold text-slate-900 dark:text-white text-sm">
            {ar ? current.label_ar : current.label_en}
            {current.required && <span className="text-rose-500 ms-1" aria-label="required">*</span>}
          </label>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {ar ? current.hint_ar : current.hint_en}
        </p>
        <textarea
          key={current.id}
          value={answers[current.id]}
          onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
          placeholder={ar ? current.placeholder_ar : current.placeholder_en}
          rows={3}
          className="w-full resize-none"
          aria-required={current.required}
          autoFocus
        />
      </div>

      {/* Navigation */}
      <div className="px-5 pb-5 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-ghost border border-slate-200 dark:border-slate-700 text-xs px-3 py-2">
              ← {ar ? "السابق" : "Back"}
            </button>
          )}
          {!current.required && step < STEPS.length - 1 && (
            <button onClick={skip} className="btn-ghost text-xs px-3 py-2 text-slate-400">
              {ar ? "تخطّ" : "Skip"}
            </button>
          )}
        </div>
        <button
          onClick={next}
          disabled={!canProceed}
          className="btn-primary text-xs px-5 py-2.5 disabled:opacity-40"
        >
          {step === STEPS.length - 1
            ? (ar ? "✨ أنشئ الموجِّه" : "✨ Build Prompt")
            : (ar ? "التالي →" : "Next →")}
        </button>
      </div>

      {/* Preview */}
      {Object.values(answers).some((v) => v.trim()) && (
        <div className="mx-5 mb-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-3">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            {ar ? "معاينة الموجِّه" : "Prompt Preview"}
          </div>
          <pre className="text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-28 overflow-auto">
            {buildPrompt(answers, ar) || (ar ? "لا شيء بعد…" : "Nothing yet…")}
          </pre>
        </div>
      )}
    </div>
  );
}
