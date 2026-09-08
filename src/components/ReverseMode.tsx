"use client";

import { useMemo, useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { analysePrompt } from "@/lib/reverse-analyzer";
import { suggestForDraft, localizedSuggestion } from "@/lib/live-suggestions";
import {
  buildImagePrompt,
  type ImageReverseAction,
  type ImagePromptInput
} from "@/lib/image-prompts";

const INTENT_KEY: Record<string, DictKey> = {
  coding: "intent.coding",     writing: "intent.writing",
  research: "intent.research", analysis: "intent.analysis",
  planning: "intent.planning", creative: "intent.creative",
  design: "intent.design",     conversation: "intent.conversation",
  image: "intent.image",       video: "intent.video",
  audio: "intent.audio",       software: "intent.software",
  website: "intent.website",   report: "intent.report",
  other: "intent.other"
};

// Inline images smaller than this — bigger ones are referenced by metadata
// only so the generated prompt doesn't exceed any model's context window.
const MAX_INLINE_BYTES = 5 * 1024 * 1024;

type ReverseTab = "text" | "image";

/**
 * Reverse mode. Two ways in:
 *   • Text  → paste a prompt and analyse it (score, structure, strengths).
 *   • Image → upload a screenshot and generate one of three vision-grade
 *             prompts: extract verbatim text / recreate the design /
 *             rewrite the same kind of content for a new scenario.
 *
 * Everything is local — text analysis is pure-function; image prompts embed
 * a data URL so any vision model (ChatGPT, Claude, Gemini) can read it.
 */
export default function ReverseMode() {
  const t = useT();
  const { locale } = useI18n();
  const [tab, setTab] = useState<ReverseTab>("text");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setTab("text")}
          aria-pressed={tab === "text"}
          className={
            "px-4 py-1.5 rounded-full text-xs font-medium transition " +
            (tab === "text"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900")
          }
        >
          📝 {t("reverse.tab.text")}
        </button>
        <button
          type="button"
          onClick={() => setTab("image")}
          aria-pressed={tab === "image"}
          className={
            "px-4 py-1.5 rounded-full text-xs font-medium transition " +
            (tab === "image"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900")
          }
        >
          🖼 {t("reverse.tab.image")}
        </button>
      </div>

      {tab === "text" ? <TextReverse /> : <ImageReverse />}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Text reverse: original analyse-the-prompt flow
// ───────────────────────────────────────────────────────────────────────────

function TextReverse() {
  const t = useT();
  const { locale } = useI18n();
  const [text, setText] = useState("");
  const [pushed, setPushed] = useState<{ before: number; after: number } | null>(null);

  const analysis = useMemo(() => (text.trim() ? analysePrompt(text) : null), [text]);
  const topSuggestion = useMemo(() => {
    if (!analysis) return null;
    return suggestForDraft(text, { intent: analysis.intent, locale }, 1)[0] ?? null;
  }, [text, analysis, locale]);

  function pushItFurther() {
    if (!topSuggestion || !analysis) return;
    const append = locale === "ar" ? topSuggestion.append_ar : topSuggestion.append_en;
    const beforeScore = analysis.score.total;
    const next = text.trim() + append;
    setText(next);
    const after = analysePrompt(next).score.total;
    setPushed({ before: beforeScore, after });
    setTimeout(() => setPushed(null), 4000);
  }

  return (
    <div className="card shadow-sm space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <label htmlFor="reverse-input" className="text-sm font-medium">
            {t("reverse.label")}
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {analysis ? `${analysis.wordCount} ${t("reverse.words")}` : ""}
          </span>
        </div>
        <textarea
          id="reverse-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full mt-2 min-h-[140px] resize-y"
          placeholder={t("reverse.placeholder")}
        />
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{t("reverse.hint")}</p>
      </div>

      {analysis && (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400">{t("reverse.detected_intent")}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
              {t(INTENT_KEY[analysis.intent] ?? "intent.other")}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · {Math.round(analysis.intentConfidence * 100)}%
            </span>
            <span className="ms-auto text-sm font-semibold tabular-nums">
              {analysis.score.total}/100
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t("reverse.skeleton")}
            </div>
            {analysis.sections.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("reverse.no_sections")}</p>
            ) : (
              <ol className="list-decimal ms-5 space-y-0.5">
                {analysis.sections.map((s, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300">{s}</li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-900/10 dark:border-emerald-800 p-3">
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              {t("reverse.strengths")}
            </div>
            <ul className="text-xs space-y-0.5 text-emerald-900 dark:text-emerald-200">
              {analysis.hasRole && <li>• {t("reverse.has_role")}</li>}
              {analysis.score.audience >= 14 && <li>• {t("reverse.has_audience")}</li>}
              {analysis.score.format >= 14 && <li>• {t("reverse.has_format")}</li>}
              {analysis.score.structure >= 14 && <li>• {t("reverse.has_structure")}</li>}
              {analysis.hasCta && <li>• {t("reverse.has_cta")}</li>}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-800 p-3">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
              {t("reverse.learn")}
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200">
              {topSuggestion
                ? (locale === "ar" ? topSuggestion.preview_ar : topSuggestion.preview_en)
                : t(analysis.weakestSuggestion as DictKey)}
            </p>
            {topSuggestion && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button type="button" onClick={pushItFurther} className="btn-primary text-xs">
                  ✨ {t("ws.btn.push_further")}
                </button>
                {pushed && (
                  <span
                    className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium tabular-nums"
                    aria-live="polite"
                  >
                    {t("reverse.pushed", { before: pushed.before, after: pushed.after })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Image reverse: upload an image, generate one of 3 vision prompts
// ───────────────────────────────────────────────────────────────────────────

function ImageReverse() {
  const t = useT();
  const { locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [action, setAction] = useState<ImageReverseAction>("extract");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function pick(list: FileList | null) {
    if (!list || !list[0]) return;
    const f = list[0];
    if (!f.type.startsWith("image/")) {
      setError(t("reverse.image.not_image"));
      return;
    }
    setError(null);
    setBusy(true);
    setFile(f);
    try {
      if (f.size <= MAX_INLINE_BYTES) {
        const url = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result ?? ""));
          r.onerror = () => rej(r.error);
          r.readAsDataURL(f);
        });
        setDataUrl(url);
      } else {
        // Don't blow up the prompt with a huge data URL.
        setDataUrl("");
      }
    } catch (e) {
      setError((e as Error)?.message ?? "read_failed");
    } finally {
      setBusy(false);
    }
  }

  const generated = useMemo<string>(() => {
    if (!file) return "";
    const input: ImagePromptInput = {
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      dataUrl,
      locale,
      hint
    };
    return buildImagePrompt(action, input);
  }, [file, dataUrl, locale, hint, action]);

  async function copyOut() {
    if (!generated) return;
    try { await navigator.clipboard.writeText(generated); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function downloadOut() {
    if (!generated) return;
    const blob = new Blob([generated], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-from-image-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clear() {
    setFile(null);
    setDataUrl("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const actions: Array<{ id: ImageReverseAction; emoji: string; titleKey: DictKey; bodyKey: DictKey }> = [
    { id: "extract",  emoji: "📜", titleKey: "reverse.image.extract.title",  bodyKey: "reverse.image.extract.body" },
    { id: "recreate", emoji: "🎨", titleKey: "reverse.image.recreate.title", bodyKey: "reverse.image.recreate.body" },
    { id: "rewrite",  emoji: "✍️", titleKey: "reverse.image.rewrite.title",  bodyKey: "reverse.image.rewrite.body" }
  ];

  return (
    <div className="card shadow-sm space-y-4">
      <div>
        <div className="text-sm font-medium">{t("reverse.image.title")}</div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("reverse.image.hint")}</p>
      </div>

      {/* Upload */}
      {!file ? (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition py-10 px-4 flex flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-300"
          >
            <span aria-hidden="true" className="text-3xl">🖼</span>
            <span className="text-sm font-medium">{t("reverse.image.upload")}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t("reverse.image.upload_hint")}</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => void pick(e.target.files)}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={file.name} className="w-16 h-16 rounded object-cover flex-shrink-0" />
          ) : (
            <span className="w-16 h-16 rounded flex items-center justify-center text-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">🖼</span>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{file.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {humanSize(file.size, locale)} · {file.type || "image/*"}
              {!dataUrl && " · " + t("files.metadata_only")}
            </div>
          </div>
          <button
            type="button"
            onClick={clear}
            className="btn-ghost text-xs px-2 py-1 border border-slate-300 dark:border-slate-700"
          >
            {t("reverse.image.change")}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      {file && !busy && (
        <>
          {/* Action picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {actions.map((a) => {
              const selected = action === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAction(a.id)}
                  aria-pressed={selected}
                  className={
                    "text-start rounded-lg border p-3 transition " +
                    (selected
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30 dark:border-brand-700"
                      : "border-slate-200 dark:border-slate-700 hover:border-brand-300")
                  }
                >
                  <div className="text-base">{a.emoji}</div>
                  <div className="mt-1 text-sm font-medium">{t(a.titleKey)}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {t(a.bodyKey)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional hint */}
          <div>
            <label htmlFor="img-hint" className="text-xs font-medium">
              {t("reverse.image.hint_label")}
            </label>
            <input
              id="img-hint"
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder={t("reverse.image.hint_placeholder")}
              className="w-full mt-1"
            />
          </div>

          {/* Generated prompt */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-2 flex-wrap px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <div className="text-xs font-medium">{t("reverse.image.output")}</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={downloadOut} className="btn-ghost text-xs px-2 py-1 border border-slate-300 dark:border-slate-700">
                  {t("ws.btn.download")}
                </button>
                <button onClick={copyOut} className="btn-primary text-xs px-2 py-1">
                  {copied ? t("ws.copied") : t("ws.btn.copy")}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap p-3 text-[12.5px] leading-relaxed font-mono bg-slate-50 dark:bg-slate-950 dark:text-slate-100 max-h-80 overflow-auto rounded-b-lg">
{generated}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────

function humanSize(bytes: number, locale: "en" | "ar"): string {
  const ar = locale === "ar";
  const KB = 1024, MB = 1024 ** 2, GB = 1024 ** 3, TB = 1024 ** 4;
  if (bytes >= TB) return `${(bytes / TB).toFixed(1)} ${ar ? "ت.ب" : "TB"}`;
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)} ${ar ? "ج.ب" : "GB"}`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} ${ar ? "م.ب" : "MB"}`;
  return `${Math.max(1, Math.round(bytes / KB))} ${ar ? "ك.ب" : "KB"}`;
}
