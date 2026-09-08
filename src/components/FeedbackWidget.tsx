"use client";

import { useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";

interface Props {
  sessionId: string | null;
  intent: string | null;
  targetModel: string | null;
  rawLength: number;
  finalLength: number;
}

const REASONS: Array<{ id: string; key: DictKey }> = [
  { id: "too_long",    key: "feedback.reason.too_long" },
  { id: "too_short",   key: "feedback.reason.too_short" },
  { id: "off_topic",   key: "feedback.reason.off_topic" },
  { id: "bad_format",  key: "feedback.reason.bad_format" },
  { id: "wrong_tone",  key: "feedback.reason.wrong_tone" },
  { id: "wrong_lang",  key: "feedback.reason.wrong_lang" }
];

/**
 * Two-step feedback widget.
 *
 *   Step 1 — thumbs up/down (immediate signal)
 *   Step 2 — only on thumbs-down: tag chips ("too long", "off topic", …)
 *            plus an optional free-text note. The chip selection makes the
 *            learning signal sharper than a binary rating alone.
 *
 * All failures are silent — the user always sees a "Thanks!" so the loop
 * never feels broken.
 */
export default function FeedbackWidget({
  sessionId,
  intent,
  targetModel,
  rawLength,
  finalLength
}: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [rating, setRating] = useState<-1 | 1 | null>(null);
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send(value: -1 | 1, finalSubmit = false) {
    if (busy) return;
    setBusy(true);
    setRating(value);
    try {
      const noteParts: string[] = [];
      if (tags.size > 0) noteParts.push("tags: " + Array.from(tags).join(", "));
      if (comment.trim()) noteParts.push(comment.trim());
      const noteJoined = noteParts.join(" | ").slice(0, 2000) || null;
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: value,
          session_id: sessionId && sessionId !== "local" ? sessionId : null,
          intent,
          target_model: targetModel,
          locale,
          raw_length: rawLength,
          final_length: finalLength,
          comment: noteJoined
        })
      });
      // For thumbs-up, dismiss immediately. For thumbs-down, only dismiss
      // once the user finishes the second step.
      if (value === 1 || finalSubmit) setSubmitted(true);
    } catch {
      if (value === 1 || finalSubmit) setSubmitted(true);
    } finally {
      setBusy(false);
    }
  }

  function toggleTag(id: string) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  if (submitted) {
    return (
      <div className="mt-3 text-xs text-emerald-700 flex items-center gap-1.5" aria-live="polite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{t("feedback.thanks")}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">{t("feedback.prompt")}</span>
        <button
          type="button"
          onClick={() => void send(1)}
          disabled={busy}
          aria-label={t("feedback.up")}
          aria-pressed={rating === 1}
          className={
            "inline-flex items-center justify-center w-8 h-8 rounded-full transition border " +
            (rating === 1
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "border-slate-300 text-slate-600 hover:border-emerald-300 hover:text-emerald-700")
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7l3.05-12.5A4 4 0 0 1 14 6V3a3 3 0 0 1 1 2.88Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setRating(-1)}
          disabled={busy}
          aria-label={t("feedback.down")}
          aria-pressed={rating === -1}
          className={
            "inline-flex items-center justify-center w-8 h-8 rounded-full transition border " +
            (rating === -1
              ? "bg-rose-50 border-rose-300 text-rose-700"
              : "border-slate-300 text-slate-600 hover:border-rose-300 hover:text-rose-700")
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14V2" />
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17l-3.05 12.5A4 4 0 0 1 10 18v3a3 3 0 0 1-1-2.88Z" />
          </svg>
        </button>
      </div>

      {/* Step 2 — only on thumbs-down */}
      {rating === -1 && (
        <div className="mt-3 rounded-lg bg-rose-50/60 border border-rose-100 p-3">
          <div className="text-xs font-medium text-rose-800">{t("feedback.reason.title")}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REASONS.map((r) => {
              const active = tags.has(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleTag(r.id)}
                  aria-pressed={active}
                  className={
                    "text-xs px-2.5 py-1 rounded-full border transition " +
                    (active
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-slate-700 border-slate-300 hover:border-rose-300")
                  }
                >
                  {t(r.key)}
                </button>
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("feedback.placeholder")}
            rows={2}
            maxLength={2000}
            className="w-full mt-2 text-sm"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => void send(-1, true)}
              disabled={busy}
              className="btn-primary text-xs"
            >
              {t("feedback.send")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
