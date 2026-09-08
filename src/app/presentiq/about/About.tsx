"use client";

import Link from "next/link";
import { AlertTriangle, Cpu, Award, ShieldCheck, BadgeCheck, Languages, FileSliders } from "lucide-react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";
import { Magnetic, Reveal, Tilt } from "@/components/presentiq/ui/motion";
import { PQ_FOUNDER_NAME, PQ_CONTACT_EMAIL } from "@/lib/presentiq/config";

export function About() {
  const { lang } = useI18n();

  return (
    <div className="space-y-12">
      <Reveal as="header" variant="single">
        <div style={{ textAlign: "center" }}>
          <span className="pq-pill pq-pill-strong">{lang === "ar" ? "من نحن" : "About"}</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--pq-text-main)" }}>
            {lang === "ar" ? "نُسمّي ما نحل: " : "We named what we solve: "}
            <span className="pq-aurora-underline">{lang === "ar" ? "بِتشورا" : "Pitchora"}</span>
          </h1>
          <p className="mt-5 mx-auto max-w-3xl text-base md:text-lg" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.6 }}>
            {lang === "ar"
              ? "بِتشورا = Pitch + Aurora. فعل تقديم الأفكار ممزوجاً بالتحوّل الضوئي من الشرارة الأولى إلى السرد المصقول. اسم واحد يصف المشكلة التي نحلها بدقّة: ردم الفجوة بين فكرة شبه مكتملة وعرض جاهز لمجلس الإدارة."
              : "Pitchora = Pitch + Aurora. The act of pitching ideas, fused with the luminous transformation from spark to polished narrative. One word that names exactly the problem we solve: closing the gap between a half-formed idea and a boardroom-ready deck."}
          </p>
        </div>
      </Reveal>

      <Reveal variant="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            Icon: AlertTriangle,
            title: lang === "ar" ? "المشكلة" : "The problem",
            body: lang === "ar"
              ? "تستهلك الفِرَق التنفيذية ساعات لتحويل ملاحظات متفرّقة إلى عرضٍ موحَّد ومحوكَم وموثَّق بالأدلّة، ثم تكرّر العملية لكل اجتماع."
              : "Executive teams burn hours turning rough notes into a coherent, governed, evidence-backed deck. Then repeat the whole process for every meeting.",
          },
          {
            Icon: Cpu,
            title: lang === "ar" ? "الحل" : "The solution",
            body: lang === "ar"
              ? "استوديو وكلاء ذكاء اصطناعي يستلم الفكرة، يجمع الأدلّة، يصوغ السرد، يُطبِّق الهويّة، يبني الشرائح، ويقيس الجاهزية على عشرة أبعاد. كلّ ذلك تلقائياً."
              : "An agent studio that takes the idea, gathers evidence, drafts the narrative, applies the brand, builds the slides, and scores readiness on 10 dimensions. All of it automatically.",
          },
          {
            Icon: Award,
            title: lang === "ar" ? "النتيجة" : "The outcome",
            body: lang === "ar"
              ? "ملف PPTX قابل للتحرير، ثنائي اللغة، محكوم بالهويّة، ومُقيَّم على عشرة أبعاد للجاهزية. جاهز للعرض على الرئيس التنفيذي."
              : "An editable PPTX, bilingual, brand-governed, and scored on 10 boardroom dimensions. Ready for the CEO.",
          },
        ].map((item, i) => {
          const Icon = item.Icon;
          return (
            <Tilt key={i} max={4}>
              <Frame4D className="p-6 h-full" interactive={false}>
                <div
                  className="grid place-items-center w-10 h-10 rounded-xl mb-3"
                  style={{
                    background: "rgba(159,205,99,0.14)",
                    color: "var(--pq-primary)",
                    border: "1px solid rgba(159,205,99,0.32)",
                  }}
                  aria-hidden
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--pq-text-main)" }}>{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.55 }}>{item.body}</p>
              </Frame4D>
            </Tilt>
          );
        })}
      </Reveal>

      {/* ── Principles — the four rules the studio is built around ─ */}
      <section className="pq-section">
        <div className="pq-section-head">
          <div className="pq-section-eyebrow">
            {lang === "ar" ? "المبادئ" : "Principles"}
          </div>
          <h2 className="pq-section-title">
            {lang === "ar" ? "أربعة مبادئ لا نتنازل عنها" : "Four rules we don't compromise"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              Icon: ShieldCheck,
              title: lang === "ar" ? "الحوكمة أولاً" : "Governance first",
              body: lang === "ar"
                ? "الهويّة والخطوط والألوان والمصطلحات تُطبَّق قبل توليد أي عنصر مرئي. لا بعد أن يقع الخطأ."
                : "Brand, fonts, colors, and terminology apply before any visual is generated. Not after it becomes a mess.",
            },
            {
              Icon: BadgeCheck,
              title: lang === "ar" ? "الأدلّة مصنّفة" : "Evidence, classified",
              body: lang === "ar"
                ? "كل عبارة تُصنَّف: حقيقة، تقدير، تقييم، أو تحتاج مُدخلات. لا أرقام مختلقة، أبداً."
                : "Every claim is labelled fact, assessment, estimate, or input required. No fabricated numbers, ever.",
            },
            {
              Icon: Languages,
              title: lang === "ar" ? "عربيّة أصيلة، لا مترجمة" : "Native Arabic, not translated",
              body: lang === "ar"
                ? "تخطيط RTL أصلي، خطوط مصمّمة للعربية، ومصطلحات مؤسّسية. لا نسخة معكوسة من الإنجليزية."
                : "Real RTL layouts, purpose-built Arabic typefaces, and a formal corporate register. Not English flipped in the other direction.",
            },
            {
              Icon: FileSliders,
              title: lang === "ar" ? "قابل للتحرير دائماً" : "Editable, always",
              body: lang === "ar"
                ? "مربّعات نص، أشكال، جداول، ورسوم بيانية حقيقية في PPTX. لا صور مسطّحة تحبس التعديل."
                : "Real PPTX text boxes, shapes, tables, and charts. Never screenshots that lock you out of the edit.",
            },
          ].map((p, i) => {
            const Icon = p.Icon;
            return (
              <Frame4D key={i} className="p-6" interactive={false}>
                <div className="pq-feat-icon" aria-hidden>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold mt-4" style={{ color: "var(--pq-text-main)" }}>{p.title}</h3>
                <p className="text-sm mt-2" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.55 }}>{p.body}</p>
              </Frame4D>
            );
          })}
        </div>
      </section>

      {/* ── Founder banner — story on the left, milestone timeline on the right ─ */}
      <Reveal variant="single">
        <Frame4D variant="pine" className="p-8 md:p-10" interactive={false}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: "var(--pq-text-main)" }}>
                {lang === "ar" ? "بُنيت في الإمارات. للمجالس في كل مكان." : "Built in the UAE. For boardrooms everywhere."}
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.65 }}>
                {lang === "ar"
                  ? `بنيت بِتشورا من قِبل ${PQ_FOUNDER_NAME} داخل زيان لتلبية احتياج محدّد: عروض تنفيذية ثنائية اللغة (إنجليزي/عربي مع RTL أصلي) بنفس مستوى التألق على الجانبين. كل اجتماع مع مؤسسة استشارية أو لجنة حكومية أو مجلس إدارة كان يكشف نفس المعاناة: نقل النقاط الذهنية إلى عرض مصقول يستهلك ساعات يمكن استرجاعها.`
                  : `Pitchora was built by ${PQ_FOUNDER_NAME} inside Zaian to scratch a specific itch: bilingual (English/Arabic with native RTL) executive presentations that look first-class in both directions. Every meeting with a consulting firm, a government committee, or a corporate board surfaced the same pain: turning mental notes into a polished deck devoured hours that should have been spent on the decision itself.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Magnetic as="a" href="/presentiq/projects/new" className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill" style={{ padding: "0.7rem 1.4rem" }}>
                  {lang === "ar" ? "جرّب الستوديو" : "Try the studio"} →
                </Magnetic>
                <Magnetic as="a" href={`mailto:${PQ_CONTACT_EMAIL}?subject=Pitchora%20hello`} className="pq-btn pq-btn-liquid pq-btn-liquid-pill" style={{ padding: "0.7rem 1.4rem" }}>
                  {lang === "ar" ? "تحدّث مع المؤسس" : "Email the founder"}
                </Magnetic>
              </div>
            </div>

            {/* Milestone timeline — fills the empty right half of the banner */}
            <ol className="pq-timeline" aria-label={lang === "ar" ? "أبرز محطات المنتج" : "Product milestones"}>
              {[
                { when: "Q4 2025", en: "Studio prototype. First bilingual PPTX out.",              ar: "نموذج الاستوديو. أوّل PPTX ثنائي اللغة." },
                { when: "Q1 2026", en: "10-dimension readiness score + brand governance shipped", ar: "درجة الجاهزية بعشرة أبعاد + حوكمة الهويّة" },
                { when: "Q2 2026", en: "Templates library + slide-level regeneration",             ar: "مكتبة القوالب + إعادة توليد شريحة بشريحة" },
                { when: "Q2 2026", en: "Public v0.5: Aurora composer and Studio mode",             ar: "الإصدار العام ٠٫٥: مؤلّف Aurora ووضع Studio" },
                { when: lang === "ar" ? "قريباً" : "Next", en: "SSO, audit-log export, private UAE deployment", ar: "تسجيل الدخول الموحّد، تصدير سجل التدقيق، النشر الخاص" },
              ].map((m, i, arr) => (
                <li key={i} className={i === arr.length - 1 ? "is-next" : ""}>
                  <div className="pq-timeline-dot" aria-hidden />
                  <div className="pq-timeline-when">{m.when}</div>
                  <div className="pq-timeline-what">{lang === "ar" ? m.ar : m.en}</div>
                </li>
              ))}
            </ol>
          </div>
        </Frame4D>
      </Reveal>

      <Reveal variant="stagger" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { num: "10", label: lang === "ar" ? "أبعاد الجودة" : "Quality dimensions" },
          { num: "EN · AR", label: lang === "ar" ? "ثنائية اللغة" : "Bilingual" },
          { num: "9", label: lang === "ar" ? "قوالب مجلس إدارة" : "Boardroom templates" },
          { num: "PPTX", label: lang === "ar" ? "تصدير قابل للتحرير" : "Editable export" },
        ].map((stat, i) => (
          <Frame4D key={i} className="p-5 text-center" interactive={false}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--pq-primary)", lineHeight: 1.1 }}>{stat.num}</div>
            <div style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--pq-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {stat.label}
            </div>
          </Frame4D>
        ))}
      </Reveal>
    </div>
  );
}
