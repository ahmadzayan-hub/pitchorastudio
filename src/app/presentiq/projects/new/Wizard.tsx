"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";
import { CURATED_PALETTES, FONT_PAIRS } from "@/lib/presentiq/brand/presets";
import { getTemplate } from "@/lib/presentiq/templates/registry";

type Mode = { code: string; nameEn: string; nameAr: string; descEn: string; descAr: string };

const MODES: Mode[] = [
  { code: "corporate_boardroom",   nameEn: "Corporate Boardroom",     nameAr: "مجلس إدارة شركات",      descEn: "Decision-oriented deck for executives.",      descAr: "عرض موجَّه لاتخاذ القرار." },
  { code: "government_boardroom",  nameEn: "Government Boardroom",    nameAr: "مجلس حكومي",              descEn: "Government executive committees.",            descAr: "اللجان التنفيذية الحكومية." },
  { code: "consulting_partner",    nameEn: "Consulting Partner",      nameAr: "شريك استشاري",            descEn: "Partner-grade client deliverables.",          descAr: "مخرجات بمستوى الشركاء الاستشاريين." },
  { code: "sales_pitch",           nameEn: "Sales Pitch",             nameAr: "عرض مبيعات",              descEn: "Persuasion + value framing.",                  descAr: "إقناع وعرض قيمة." },
  { code: "project_steering",      nameEn: "Project Steering",        nameAr: "لجنة توجيه مشروع",         descEn: "Steering committee status & decisions.",      descAr: "حالة وقرارات لجنة التوجيه." },
  { code: "technical_to_executive",nameEn: "Technical → Executive",   nameAr: "تقني ← تنفيذي",           descEn: "Translate technical detail upward.",          descAr: "ترجمة التفاصيل التقنية للمستوى التنفيذي." },
  { code: "strategy_deck",         nameEn: "Strategy",                nameAr: "استراتيجية",              descEn: "Vision, options, roadmap.",                    descAr: "الرؤية والخيارات وخارطة الطريق." },
  { code: "kpi_dashboard",         nameEn: "KPI Dashboard",           nameAr: "لوحة مؤشرات",             descEn: "Performance & health views.",                  descAr: "عروض الأداء والمؤشرات." },
  { code: "training",              nameEn: "Training",                nameAr: "تدريب",                    descEn: "Learning decks with bilingual narration.",     descAr: "عروض تعليمية بسرد ثنائي اللغة." },
  { code: "investor_business_case",nameEn: "Investor / Business Case",nameAr: "حالة عمل / استثمار",       descEn: "Numbers + recommendation.",                    descAr: "الأرقام والتوصية." },
  { code: "tender_proposal",       nameEn: "Tender / Proposal",       nameAr: "عطاء / عرض فني",          descEn: "Bid response & methodology.",                  descAr: "الردّ على العطاء والمنهجية." },
];

export function Wizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<string>("corporate_boardroom");
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("");
  const [decision, setDecision] = useState("");
  const [language, setLanguage] = useState<"en" | "ar" | "bilingual">("bilingual");
  const [confidentiality, setConfidentiality] = useState("internal");
  const [slideCount, setSlideCount] = useState(10);
  const [duration, setDuration] = useState(20);

  // Prefill the brief from the landing-page composer (?prompt=&slides=&template=).
  // Only runs once, on first mount, so the user's edits aren't clobbered.
  useEffect(() => {
    const promptParam = searchParams?.get("prompt");
    const slidesParam = searchParams?.get("slides");
    const stepParam = searchParams?.get("step");
    const templateParam = searchParams?.get("template");
    if (promptParam) {
      setObjective((prev) => prev || promptParam);
      const firstLine = promptParam.split(/[.\n]/)[0]?.trim() ?? "";
      if (firstLine && firstLine.length >= 2) {
        setTitle((prev) => prev || firstLine.slice(0, 80));
      }
      // Jump straight into the Brief step so the user can confirm.
      setStep(1);
    }
    if (slidesParam) {
      const n = Number(slidesParam);
      if (Number.isFinite(n)) setSlideCount(Math.min(60, Math.max(3, Math.round(n))));
    }
    if (templateParam) {
      // Resolve the template from the registry — gives us a real outline,
      // recommended preset, default slide count + duration. The wizard
      // pre-fills the brief so the user can hit Continue and accept it.
      const tpl = getTemplate(templateParam);
      if (tpl) {
        setTemplateCode(tpl.code);
        setMode(tpl.presentationMode);
        setSlideCount(tpl.defaultSlides);
        setDuration(tpl.defaultDurationMin);
        const tplName = lang === "ar" ? tpl.nameAr : tpl.nameEn;
        setTitle((prev) => prev || `${tplName} — ${new Date().toISOString().slice(0, 10)}`);
        setObjective((prev) => prev || (lang === "ar" ? tpl.taglineAr : tpl.taglineEn));
        setStep((s) => (s === 0 ? 1 : s));
      }
    }
    if (stepParam === "sources") setStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filesUploaded, setFilesUploaded] = useState<string[]>([]);
  const [outline, setOutline] = useState<{ slide_number: number; title: string; purpose: string }[] | null>(null);

  const [paletteId, setPaletteId] = useState<string>(CURATED_PALETTES[0].id);
  const [fontPairId, setFontPairId] = useState<string>(FONT_PAIRS[0].id);
  const [brandKitId, setBrandKitId] = useState<string | null>(null);
  const [templateCode, setTemplateCode] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploaded, setLogoUploaded] = useState(false);

  // Demo-mode reliability shim — Vercel's serverless lambdas can drop the
  // demo cookie between hops. Pin the just-created project on every wizard
  // request as `x-pq-demo-project` (base64 JSON); the route handler falls
  // back to this header when the cookie store comes up empty.
  function demoHeaders(extra: Record<string, string> = {}): Record<string, string> {
    if (!createdProject) return extra;
    try {
      const json = JSON.stringify(createdProject);
      const b64 = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      return { ...extra, "x-pq-demo-project": b64 };
    } catch {
      return extra;
    }
  }

  const STEPS: any[] = [
    "wiz.steps.mode", "wiz.steps.brief", "wiz.steps.sources",
    "wiz.steps.brand", "wiz.steps.outline", "wiz.steps.generate", "wiz.steps.done",
  ];

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  function clampedBrief() {
    const slides = Math.min(60, Math.max(3, Number.isFinite(slideCount) ? Math.round(slideCount) : 10));
    const mins   = Math.min(180, Math.max(5, Number.isFinite(duration)   ? Math.round(duration)   : 20));
    return { slides, mins };
  }

  async function createProject() {
    setBusy(true); setError(null);
    const { slides, mins } = clampedBrief();
    if (slides !== slideCount) setSlideCount(slides);
    if (mins   !== duration)   setDuration(mins);
    if (!title || title.trim().length < 2) {
      setError("Title is required (at least 2 characters).");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch("/api/presentiq/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          audience: audience.trim() || undefined,
          objective: objective.trim() || undefined,
          decision_required: decision.trim() || undefined,
          language_mode: language,
          presentation_mode: mode,
          confidentiality_level: confidentiality,
          target_slide_count: slides,
          target_duration_min: mins,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const issues = Array.isArray(data?.error?.details) ? data.error.details : [];
        const friendly = issues
          .map((i: any) => `${(i.path ?? []).join(".") || "field"}: ${i.message}`)
          .join("; ");
        throw new Error(friendly || data?.error?.message || "create_failed");
      }
      setCreatedId(data.project.id);
      setCreatedProject(data.project);
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveBrandSelection() {
    // Materialise the selected palette + font pair as a brand kit, then
    // attach it to the project so the PPTX renderer picks it up. If the
    // user uploaded a company logo, attach it to the kit so slide masters
    // (top-right by default) can render it during PPTX export.
    if (!createdId) { next(); return; }
    setBusy(true); setError(null);
    try {
      const palette = CURATED_PALETTES.find((p) => p.id === paletteId) ?? CURATED_PALETTES[0];
      const fonts = FONT_PAIRS.find((f) => f.id === fontPairId) ?? FONT_PAIRS[0];
      const kitRes = await fetch("/api/presentiq/brand-kits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: `${palette.nameEn} · ${fonts.label}`,
          colors: {
            primary: palette.colors.primary,
            secondary: palette.colors.secondary,
            accent_1: palette.colors.accent[0],
            accent_2: palette.colors.accent[1],
            accent_3: palette.colors.accent[2],
            background: palette.colors.background,
            surface: palette.colors.surface,
            foreground: palette.colors.foreground,
          },
          fonts: { en_primary: fonts.en, ar_primary: fonts.ar },
        }),
      });
      const kitData = await kitRes.json();
      if (!kitRes.ok) throw new Error(kitData?.error?.message ?? "brand_kit_failed");
      const kitId = kitData.brand_kit.id;
      setBrandKitId(kitId);

      // Upload company logo (optional) — best-effort, non-fatal.
      if (companyLogo) {
        try {
          const fd = new FormData();
          fd.append("file", companyLogo);
          fd.append("locale", lang === "ar" ? "ar" : "en");
          const lr = await fetch(`/api/presentiq/brand-kits/${kitId}/upload-logo`, {
            method: "POST",
            headers: demoHeaders(),
            body: fd,
          });
          if (lr.ok) setLogoUploaded(true);
        } catch { /* keep going — logo is optional */ }
      }

      const patchRes = await fetch(`/api/presentiq/projects/${createdId}`, {
        method: "PATCH",
        headers: demoHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ brand_kit_id: kitId }),
      });
      if (!patchRes.ok) {
        const d = await patchRes.json().catch(() => ({}));
        throw new Error(d?.error?.message ?? "patch_failed");
      }
      const patched = await patchRes.json().catch(() => null);
      if (patched?.project) setCreatedProject(patched.project);
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) { setCompanyLogo(null); setLogoPreview(null); return; }
    if (f.size > 5 * 1024 * 1024) {
      setError(lang === "ar" ? "حجم الشعار يجب أن يكون أقل من 5MB" : "Logo must be smaller than 5 MB");
      e.target.value = "";
      return;
    }
    setCompanyLogo(f);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  }

  async function uploadFiles() {
    if (!createdId || !files.length) { next(); return; }
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("file", f);
      const res = await fetch(`/api/presentiq/projects/${createdId}/files`, {
        method: "POST",
        headers: demoHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "upload_failed");
      setFilesUploaded(data.items.map((i: any) => i.filename));
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function generateBlueprint() {
    if (!createdId) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${createdId}/blueprint`, {
        method: "POST",
        headers: demoHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ template_code: templateCode ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "blueprint_failed");
      setOutline(data.blueprint?.recommended_structure ?? []);
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function generateDeck() {
    if (!createdId) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${createdId}/slides`, {
        method: "POST",
        headers: demoHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "generation_failed");
      router.push(`/presentiq/projects/${createdId}/editor`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Frame4D className="p-0 overflow-hidden" interactive={false}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(66,87,34,0.16)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--pq-text)" }}>{t(STEPS[step])}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--pq-text-mute)" }}>
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="inline-block h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? 24 : 8,
                  background: i <= step ? "var(--pq-olive)" : "rgba(66,87,34,0.22)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {error && (
          <div className="pq-alert" role="alert">
            {t("wiz.error")}: {error}
          </div>
        )}

        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m) => {
              const active = mode === m.code;
              return (
                <button
                  key={m.code}
                  onClick={() => setMode(m.code)}
                  type="button"
                  className="text-start rounded-2xl p-4 transition border"
                  style={{
                    background: active ? "var(--pq-grad-pine)" : "rgba(255,255,255,0.92)",
                    borderColor: active ? "var(--pq-olive)" : "rgba(66,87,34,0.20)",
                    color: active ? "var(--pq-cream)" : "var(--pq-deep)",
                    boxShadow: active ? "0 14px 28px -10px rgba(42,56,21,0.42)" : "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="font-semibold">{lang === "ar" ? m.nameAr : m.nameEn}</div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: active ? "rgba(244,242,233,0.86)" : "var(--pq-text-soft)" }}
                  >
                    {lang === "ar" ? m.descAr : m.descEn}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label>{t("wiz.title")}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Steering Committee" />
            </div>
            <div>
              <label>{t("wiz.audience")}</label>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Executive Director" />
            </div>
            <div>
              <label>{t("wiz.language")}</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                <option value="en">{t("wiz.lang.en")}</option>
                <option value="ar">{t("wiz.lang.ar")}</option>
                <option value="bilingual">{t("wiz.lang.bi")}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label>{t("wiz.objective")}</label>
              <textarea rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What outcome does this deck drive?" />
            </div>
            <div className="sm:col-span-2">
              <label>{t("wiz.decision")}</label>
              <input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Approve Option B corrective plan" />
            </div>
            <div>
              <label>{t("wiz.slides")}</label>
              <input
                type="number"
                min={3}
                max={60}
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                onBlur={() => setSlideCount((v) => Math.min(60, Math.max(3, Number.isFinite(v) ? Math.round(v) : 10)))}
              />
            </div>
            <div>
              <label>{t("wiz.duration")}</label>
              <input
                type="number"
                min={5}
                max={180}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                onBlur={() => setDuration((v) => Math.min(180, Math.max(5, Number.isFinite(v) ? Math.round(v) : 20)))}
              />
            </div>
            <div>
              <label>{t("wiz.confidentiality")}</label>
              <select value={confidentiality} onChange={(e) => setConfidentiality(e.target.value)}>
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="strictly_confidential">Strictly Confidential</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label>{t("wiz.upload")}</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm"
            />
            {files.length > 0 && (
              <ul className="text-sm space-y-1" style={{ color: "var(--pq-text)" }}>
                {files.map((f) => (
                  <li key={f.name}>· {f.name}{" "}
                    <span style={{ color: "var(--pq-text-mute)" }}>({Math.round(f.size / 1024)} kB)</span>
                  </li>
                ))}
              </ul>
            )}
            {filesUploaded.length > 0 && (
              <div
                className="rounded-xl px-3 py-2 text-sm"
                style={{ background: "rgba(123,142,88,0.20)", color: "var(--pq-deep)", border: "1px solid rgba(66,87,34,0.22)" }}
              >
                Uploaded: {filesUploaded.join(", ")}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm" style={{ color: "var(--pq-text-soft)" }}>
              {lang === "ar"
                ? "اختر لوحة الألوان وزوج الخطوط (إنجليزي/عربي). يمكنك دائمًا تخصيص حقيبة العلامة لاحقًا."
                : "Pick a colour palette and an EN/AR font pair. You can always customise the brand kit later."}
            </p>

            <div>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--pq-text-mute)" }}>
                {lang === "ar" ? "لوحة الألوان" : "Palette"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CURATED_PALETTES.map((p) => {
                  const active = paletteId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaletteId(p.id)}
                      className="text-start rounded-2xl p-4 border transition"
                      style={{
                        background: active ? "rgba(123,142,88,0.16)" : "rgba(255,255,255,0.92)",
                        borderColor: active ? p.colors.primary : "rgba(66,87,34,0.20)",
                        boxShadow: active ? "0 14px 28px -10px rgba(42,56,21,0.30)" : "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold" style={{ color: "var(--pq-text)" }}>
                            {lang === "ar" ? p.nameAr : p.nameEn}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[p.colors.primary, p.colors.secondary, p.colors.accent[0], p.colors.accent[1], p.colors.surface].map((c, i) => (
                            <span key={i} className="h-5 w-5 rounded-md" style={{ background: c, border: "1px solid rgba(0,0,0,0.08)" }} />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--pq-text-mute)" }}>
                {lang === "ar" ? "زوج الخطوط (إنجليزي · عربي)" : "Font pair (EN · AR)"}
              </div>
              <select value={fontPairId} onChange={(e) => setFontPairId(e.target.value)}>
                {FONT_PAIRS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* ── Company logo upload (optional) ─────────────────────────── */}
            <div>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--pq-text-mute)" }}>
                {lang === "ar" ? "شعار الشركة (اختياري — يظهر على الشرائح)" : "Company logo (optional — appears on slides)"}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label
                  className="pq-btn pq-btn-secondary"
                  style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  <span aria-hidden>↑</span>{" "}
                  {lang === "ar" ? "ارفع شعاراً" : "Upload logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={onLogoSelected}
                    className="sr-only"
                  />
                </label>
                {logoPreview && (
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(159,205,99,0.32)" }}
                  >
                    {/* Uploaded logos come in as blob URLs the user just
                        picked — next/image can't optimize those (unknown
                        domain, unknown dimensions). A plain <img> is the
                        correct primitive here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      decoding="async"
                      loading="lazy"
                      style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 6, background: "#fff" }}
                    />
                    <span className="text-xs" style={{ color: "var(--pq-text-secondary)" }}>
                      {companyLogo?.name}
                    </span>
                    <button
                      type="button"
                      className="pq-btn pq-btn-ghost"
                      style={{ padding: "0.25rem 0.55rem", fontSize: "0.75rem" }}
                      onClick={() => { setCompanyLogo(null); setLogoPreview(null); }}
                      aria-label={lang === "ar" ? "إزالة الشعار" : "Remove logo"}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--pq-text-mute)" }}>
                {lang === "ar"
                  ? "PNG / JPG / SVG · حتى 5MB · يُستخدم على الشرائح."
                  : "PNG / JPG / SVG · up to 5 MB · used as the per-slide masthead."}
              </p>
            </div>

            <span className="pq-pill">{mode.replace(/_/g, " ")}</span>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-sm" style={{ color: "var(--pq-text-soft)" }}>
            <p>{t("wiz.outline.note")}</p>
            {outline && outline.length > 0 && (
              <ol className="space-y-2">
                {outline.map((s) => (
                  <li
                    key={s.slide_number}
                    className="rounded-xl px-3 py-2 text-sm flex gap-3"
                    style={{ background: "rgba(123,142,88,0.12)", border: "1px solid rgba(66,87,34,0.16)" }}
                  >
                    <span className="font-semibold" style={{ color: "var(--pq-olive)" }}>
                      {String(s.slide_number).padStart(2, "0")}
                    </span>
                    <span style={{ color: "var(--pq-deep)" }}>
                      <strong>{s.title}</strong>
                      <span style={{ color: "var(--pq-text-mute)" }}> — {s.purpose}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <button onClick={generateBlueprint} disabled={busy || !createdId} className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
              {busy ? t("wiz.generating") : t("wiz.gen.outline")}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 text-sm" style={{ color: "var(--pq-text-soft)" }}>
            <p>{t("wiz.deck.note")}</p>
            <button onClick={generateDeck} disabled={busy || !createdId} className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
              {busy ? t("wiz.generating") : t("wiz.gen.deck")}
            </button>
          </div>
        )}

        {step === 6 && <div className="text-sm" style={{ color: "var(--pq-text-soft)" }}>Redirecting to editor…</div>}

        <div className="flex items-center justify-between pt-5 border-t" style={{ borderColor: "rgba(66,87,34,0.14)" }}>
          <button onClick={prev} disabled={step === 0 || busy} className="pq-btn pq-btn-ghost">
            <span className="pq-flip" aria-hidden>←</span> {t("wiz.back")}
          </button>
          {step === 0 && <button onClick={next} disabled={busy} className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">{t("wiz.continue")}</button>}
          {step === 1 && (
            <button onClick={createProject} disabled={!title || busy} className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
              {busy ? t("wiz.creating") : t("wiz.create")}
            </button>
          )}
          {step === 2 && (
            <button onClick={uploadFiles} disabled={busy} className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
              {busy ? t("wiz.creating") : files.length ? t("wiz.continue") : t("wiz.skip")}
            </button>
          )}
          {step === 3 && (
            <button onClick={saveBrandSelection} disabled={busy} className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
              {busy ? t("wiz.creating") : t("wiz.continue")}
            </button>
          )}
        </div>
      </div>
    </Frame4D>
  );
}
