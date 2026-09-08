"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import type { Intent } from "@/lib/local-engine";

interface Props {
  /** Currently selected intent (auto-detected from the user's text). */
  active: Intent;
  /** When the user explicitly picks a domain, lock it. Pass `null` to reset
   *  back to "auto-detect from text". */
  onPick: (intent: Intent | null) => void;
  /** Optional: when set, shown as a small "auto" tag next to the active pill. */
  autoDetected?: boolean;
  className?: string;
}

interface Domain {
  id: Intent;
  emoji: string;
  ar: string;
  en: string;
}

/**
 * Every supported domain visible at once — so the user immediately sees the
 * platform handles all 15 prompt types, not just images. Clicking a pill
 * locks the active intent (overriding auto-detect). Clicking it again — or
 * the "Auto" pill — releases the lock.
 *
 * The picker is intentionally horizontal-scrolling on small screens rather
 * than collapsed: the discoverability is the whole point.
 */
const DOMAINS: Domain[] = [
  { id: "writing",      emoji: "✍️", ar: "كتابة",       en: "Writing" },
  { id: "coding",       emoji: "💻", ar: "برمجة",       en: "Coding" },
  { id: "software",     emoji: "📱", ar: "تطبيقات",    en: "Software" },
  { id: "website",      emoji: "🌐", ar: "موقع",        en: "Website" },
  { id: "research",     emoji: "🔍", ar: "بحث",         en: "Research" },
  { id: "analysis",     emoji: "📊", ar: "تحليل",       en: "Analysis" },
  { id: "report",       emoji: "📄", ar: "تقرير",       en: "Report" },
  { id: "planning",     emoji: "🗓",  ar: "تخطيط",      en: "Planning" },
  { id: "creative",     emoji: "🎭", ar: "إبداع",       en: "Creative" },
  { id: "design",       emoji: "🎨", ar: "تصميم",       en: "Design" },
  { id: "image",        emoji: "🖼", ar: "صورة",        en: "Image" },
  { id: "video",        emoji: "🎬", ar: "فيديو",       en: "Video" },
  { id: "audio",        emoji: "🎙", ar: "صوت",         en: "Audio" },
  { id: "conversation", emoji: "💬", ar: "محادثة",     en: "Conversation" },
  { id: "other",        emoji: "✨", ar: "أخرى",        en: "Other" }
];

export default function DomainPicker({ active, onPick, autoDetected, className }: Props) {
  const t = useT();
  const localeIsAr = t("app.name") === "زيان ستوديو";

  return (
    <div className={"mt-3 " + (className ?? "")} aria-label={t("domain.label")}>
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1.5">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {t("domain.label")}
        </span>
        {autoDetected && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {t("domain.auto_detected")}
          </span>
        )}
      </div>

      <div className="-mx-1 px-1 flex gap-1.5 overflow-x-auto pb-1">
        {/* Auto pill — releases the manual lock */}
        <button
          type="button"
          onClick={() => onPick(null)}
          aria-pressed={autoDetected ?? false}
          className={
            "shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition " +
            (autoDetected
              ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700 dark:text-brand-300"
              : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400")
          }
        >
          <span aria-hidden="true">🪄</span>
          <span>{t("domain.auto")}</span>
        </button>

        {DOMAINS.map((d) => {
          const selected = active === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onPick(d.id)}
              aria-pressed={selected}
              className={
                "shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition " +
                (selected
                  ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400")
              }
            >
              <span aria-hidden="true">{d.emoji}</span>
              <span>{localeIsAr ? d.ar : d.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
