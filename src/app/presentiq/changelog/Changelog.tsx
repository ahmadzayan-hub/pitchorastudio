"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";
import { PQ_CONTACT_EMAIL } from "@/lib/presentiq/config";

type Entry = {
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
};

const V0_2_DELTAS: Entry[] = [
  // ── v0.5 release notes — Pitchora rebrand + creative motion ────
  {
    titleEn: "v0.5 — Pitchora rebrand · Aurora motion · platform now named for the problem it solves",
    titleAr: "الإصدار 0.5 — إعادة هوية باسم بِتشورا، حركات Aurora، اسم المنصة يعكس المشكلة التي تحلّها",
    bodyEn: "PresentIQ becomes Pitchora — 'Pitch + Aurora' — naming the core promise: closing the gap between a half-formed idea and a polished, boardroom-ready deck. New animated wordmark with a soft aurora arc, parallax mesh orbs on hero, magnetic CTAs, scroll-revealed sections, tilt-on-hover template cards, and a refreshed letter-staggered headline. All motion respects prefers-reduced-motion.",
    bodyAr: "تصبح PresentIQ بِتشورا — Pitch + Aurora — تسمية تعكس الوعد الأساسي: جسر الفجوة بين فكرة أوّلية وعرض مصقول جاهز للمجلس. شعار متحرّك بقوس Aurora ناعم، كرات شبكة منظورية في القسم البطل، أزرار CTA مغناطيسية، أقسام تظهر بالتمرير، بطاقات قوالب تميل عند المرور، وعنوان رئيسي بدخول حرفي متدرّج. الحركات تحترم prefers-reduced-motion.",
  },
  {
    titleEn: "v0.4 — Zaian Sky palette + liquid buttons + motion system",
    titleAr: "الإصدار 0.4 — هوية «سماء زيان» وأزرار سائلة ونظام حركة",
    bodyEn: "Indigo + cyan + magenta sky palette over deep navy replaces the v0.3 forest scheme. Liquid frosted-glass buttons (translucent capsule, double inset highlight, top gloss) ship across the wizard, editor actions, and templates. Subtle scroll-aware motion: hero stagger, mesh aurora pan, focus glows.",
    bodyAr: "تحلّ هوية «سماء زيان» (نيلي + سماوي + فوشي على كحلي عميق) محل خضرة الإصدار 0.3. أزرار سائلة بزجاج معتم (كبسولة شفافة، إضاءة داخلية مزدوجة، انعكاس علوي) عبر المعالج وإجراءات المحرر والقوالب. حركات هادئة: درج البطل، تموّج خلفية الشبكة، حواف تركيز ساطعة.",
  },
  {
    titleEn: "Real templates registry — 9 boardroom outlines, bilingual",
    titleAr: "سجل قوالب حقيقي — ٩ مخططات مجلس إدارة ثنائية اللغة",
    bodyEn: "Each template now ships with a real ordered outline (12–18 slides, EN/AR title + purpose), recommended preset, default slide count and duration. Picking a template pre-fills the wizard and projects the template's outline straight onto the Blueprint step.",
    bodyAr: "يأتي كل قالب الآن بمخطّط مرتّب حقيقي (١٢–١٨ شريحة، عنوان EN/AR + الغرض)، إعداد موصى به، عدد شرائح ومدة افتراضية. اختيار القالب يعبّئ المعالج ويُسقط مخطّطه مباشرة على خطوة المخطّط.",
  },
  {
    titleEn: "Slim footer + ChatlyAI-style composer hero",
    titleAr: "تذييل مختصر + قسم بطل بأسلوب ChatlyAI",
    bodyEn: "The 4-column sitemap footer is replaced by a single compact band (brand + trust pills + social + copyright). The landing hero is now a centered prompt composer with a Classic / Studio mode toggle, slide-count picker, and a categorised template grid below.",
    bodyAr: "استُبدل تذييل القوائم الأربع بشريط مختصر (الهوية + شارات الثقة + الاجتماعي + حقوق النشر). أصبح القسم البطل مُؤلِّفاً نصياً مركزياً بمفتاح كلاسيكي/استوديو ومنتقي عدد شرائح وشبكة قوالب أسفله.",
  },
  {
    titleEn: "Demo flow hardened against serverless lambda boundaries",
    titleAr: "تدفّق التجربة محصَّن ضد حدود اللامبدا",
    bodyEn: "Cookie store now base64-encodes (vs URI-encodes), and the wizard pins the just-created project as an x-pq-demo-project header on every step — so 'project not found' on Outline is fixed even when cookies get dropped.",
    bodyAr: "يستخدم مخزن الكوكي ترميز Base64 بدلاً من URI، ويثبّت المعالج المشروع كرأس x-pq-demo-project في كل خطوة — يعالج خطأ «لم يُعثر على المشروع» في خطوة المخطّط حتى عند سقوط الكوكي.",
  },
  {
    titleEn: "Corrupt PPTX export fixed",
    titleAr: "إصلاح تلف ملف PPTX المُصدَّر",
    bodyEn: "The demo export now allocates a private Uint8Array and copies the rendered bytes into it, instead of slicing into Node's pooled Buffer ArrayBuffer (which could include trailing garbage and corrupt the zip).",
    bodyAr: "يخصّص تصدير التجربة الآن Uint8Array خاصاً وينسخ البايتات الناتجة إليه، بدلاً من اقتطاع ArrayBuffer للحوض المشترك في Node (الذي قد يضيف بايتات زائدة ويُتلف الأرشيف).",
  },
  {
    titleEn: "v0.3 — dark forest UI, lime accents, integrated Pitchora (then PresentIQ) logo",
    titleAr: "الإصدار 0.3 — واجهة داكنة بلون الغابة وأخضر ليموني وشعار بِتشورا (الذي عُرف سابقاً بـ PresentIQ) المدمج",
    bodyEn: "Boardroom-grade dark theme based on the new brand sheet. Header, hero, dashboard, footer, editor and quality panel all repainted. New SVG logo (mark + wordmark + favicon) shipped across the platform.",
    bodyAr: "سمة داكنة بمستوى مجالس الإدارة وفق دليل الهوية الجديد. أُعيد طلاء الترويسة والقسم البطل ولوحة التحكم والتذييل والمحرّر ولوحة الجودة. يصاحب ذلك شعار SVG جديد (الرمز + النص + الأيقونة) عبر المنصة.",
  },
  {
    titleEn: "Quality engine recalibrated — demo deck reads 97/100",
    titleAr: "إعادة معايرة محرك الجودة — العرض التجريبي يقرأ 97/100",
    bodyEn: "Evidence integrity now exempts cover/decision/glossary slides; visual quality rewards layout variety; executive clarity reads the key message; demo deck ships with a 12-item evidence base.",
    bodyAr: "تتجاوز سلامة الأدلة شرائح الغلاف والقرار والمصطلحات؛ تكافأ الجودة البصرية على تنوع التخطيطات؛ تقرأ الوضوح التنفيذي الرسالة الرئيسية؛ يتضمن العرض التجريبي ١٢ بنداً من الأدلة.",
  },
  {
    titleEn: "New Pine palette + 4D-frame design system",
    titleAr: "هوية لونية Pine جديدة ونظام إطارات بأبعاد ٤D",
    bodyEn: "Spearmint, Emerald, Teal, Pine — calmer, more boardroom-appropriate. Cards now have multi-layered depth and subtle parallax.",
    bodyAr: "ألوان Spearmint وEmerald وTeal وPine — أكثر هدوءاً وملاءمة لمجالس الإدارة. للبطاقات عمق متعدد الطبقات وحركة هادئة.",
  },
  {
    titleEn: "Bilingual EN/AR with full RTL",
    titleAr: "ثنائية اللغة EN/AR مع دعم RTL كامل",
    bodyEn: "Toggle the platform language from the header. Layout, padding, arrows and text direction all flip correctly.",
    bodyAr: "بدّل لغة المنصة من الترويسة. التخطيط والمسافات والأسهم واتجاه النص تتبدّل بشكل صحيح.",
  },
  {
    titleEn: "Demo mode — no signup required",
    titleAr: "وضع تجربة — دون تسجيل",
    bodyEn: "The trial wizard, dashboard, brand kits, blueprint and slide generation all work without authentication. The previous \"Authentication required\" error is fixed.",
    bodyAr: "معالج التجربة ولوحة التحكم وهويات العلامة وتوليد المخطّط والشرائح تعمل دون تسجيل دخول. تم إصلاح خطأ «المصادقة مطلوبة».",
  },
  {
    titleEn: "Outline editor in the wizard",
    titleAr: "محرّر المخطّط داخل المعالج",
    bodyEn: "Review the AI-proposed slide outline before the deck is generated. Easy way to course-correct the storyline early.",
    bodyAr: "راجع مخطّط الشرائح المقترح من الذكاء قبل توليد العرض. طريقة سريعة لتعديل السرد مبكراً.",
  },
  {
    titleEn: "Templates gallery (SCQA, Pyramid, OKR, PESTEL, UAE Gov)",
    titleAr: "معرض قوالب (SCQA, Pyramid, OKR, PESTEL, حكومي إماراتي)",
    bodyEn: "9 boardroom-grade narrative templates. Each is bilingual and auto-applies the right structure.",
    bodyAr: "٩ قوالب سردية بمستوى مجالس الإدارة، ثنائية اللغة وتُطبَّق بنيتها تلقائياً.",
  },
  {
    titleEn: "Contact + trial-feedback flow",
    titleAr: "تواصل وتجربة وتغذية راجعة",
    bodyEn: `Floating contact bubble + dedicated /contact page. Feedback routes to ${PQ_CONTACT_EMAIL}.`,
    bodyAr: `زر تواصل عائم وصفحة مخصصة. ترسل الملاحظات إلى ${PQ_CONTACT_EMAIL}.`,
  },
  {
    titleEn: "Removed organisation-specific copy",
    titleAr: "إزالة المراجع الخاصة بمؤسّسات بعينها",
    bodyEn: "Pitchora is org-agnostic. Government Boardroom and Government Committee templates remain available, without naming a specific authority.",
    bodyAr: "أصبحت بِتشورا محايدة تنظيمياً. تبقى قوالب المجلس الحكومي واللجنة الحكومية متاحة دون تسمية جهة بعينها.",
  },
];

const ROADMAP_NEXT: Entry[] = [
  { titleEn: "Live theme picker", titleAr: "اختيار حيّ للسمة", bodyEn: "Apply a theme and preview it across all slides.", bodyAr: "طبّق سمة وشاهدها على كل الشرائح." },
  { titleEn: "Inline AI image generation", titleAr: "توليد الصور بالذكاء داخل المحرّر", bodyEn: "Generate brand-aligned images per slide.", bodyAr: "ولّد صوراً متوافقة مع الهوية لكل شريحة." },
  { titleEn: "View-only share links", titleAr: "روابط مشاركة للعرض فقط", bodyEn: "Send a link without exposing the editor.", bodyAr: "أرسل رابطاً دون كشف المحرّر." },
  { titleEn: "Version compare with diff view", titleAr: "مقارنة النسخ مع عرض الفروقات", bodyEn: "See exactly what changed between deck versions.", bodyAr: "اعرف ما تغيّر بدقّة بين النسخ." },
  { titleEn: "Live data-bound charts (Supabase / CSV)", titleAr: "مخططات مرتبطة ببيانات حيّة", bodyEn: "Charts refresh from source on open.", bodyAr: "تتحدّث المخططات من المصدر عند الفتح." },
];

export function Changelog() {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-8">
      <header>
        <span className="pq-pill pq-pill-strong">v0.5 · {new Date().toLocaleDateString(lang === "ar" ? "ar-AE" : "en-AE")}</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-text)" }}>
          {t("v2.title")}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--pq-text-soft)" }}>
          {lang === "ar"
            ? "تجربة أنظف، ودعم عربية رسمية، وحوكمة هوية أقوى، ومنصة أسرع للتجربة."
            : "A cleaner experience, formal Arabic support, stronger brand governance, and a faster path to trial."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {V0_2_DELTAS.map((e) => (
          <Frame4D key={e.titleEn} className="p-5">
            <h3 className="font-semibold" style={{ color: "var(--pq-text)" }}>
              {lang === "ar" ? e.titleAr : e.titleEn}
            </h3>
            <p className="text-sm mt-2" style={{ color: "var(--pq-text-soft)", lineHeight: 1.55 }}>
              {lang === "ar" ? e.bodyAr : e.bodyEn}
            </p>
          </Frame4D>
        ))}
      </div>

      <Frame4D variant="pine" className="p-8" interactive={false}>
        <h2 className="text-xl font-semibold" style={{ color: "var(--pq-spearmint)" }}>
          {lang === "ar" ? "ما يلي بعد ذلك" : "Coming next"}
        </h2>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {ROADMAP_NEXT.map((e) => (
            <li key={e.titleEn} className="text-sm" style={{ color: "var(--pq-spearmint)", opacity: 0.92 }}>
              <strong>{lang === "ar" ? e.titleAr : e.titleEn}</strong>{" "}
              <span style={{ opacity: 0.78 }}>— {lang === "ar" ? e.bodyAr : e.bodyEn}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/presentiq/contact"
          className="pq-btn mt-6"
          style={{ background: "var(--pq-spearmint)", color: "var(--pq-pine)" }}
        >
          {t("land.cta.contact")} →
        </Link>
      </Frame4D>
    </div>
  );
}
