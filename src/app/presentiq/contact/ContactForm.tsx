"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";
import { PQ_CONTACT_EMAIL } from "@/lib/presentiq/config";

const CONTACT_EMAIL = PQ_CONTACT_EMAIL;

export function ContactForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendBtnRef = useRef<HTMLButtonElement | null>(null);
  // Removed: confetti burst on send. Purely decorative and cost a
  // module + a canvas allocation for a moment users are already
  // celebrating on their own screen.

  async function submit() {
    setSending(true); setError(null);
    try {
      const res = await fetch("/api/presentiq/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, subject, message, source: "presentiq.contact" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? "send_failed");
      }
      setSent(true);
      setSubject(""); setMessage("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-text)" }}>
          {t("ctc.title")}
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--pq-text-soft)" }}>{t("ctc.lede")}</p>
      </header>

      <Frame4D variant="pine" interactive={false} className="p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80">Direct</div>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Pitchora%20—%20trial%20feedback`}
            className="text-xl font-semibold hover:underline"
            style={{ color: "var(--pq-spearmint)" }}
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="pq-btn"
          style={{ background: "var(--pq-spearmint)", color: "var(--pq-pine)" }}
        >
          ✉ {t("ctc.email")}
        </a>
      </Frame4D>

      <Frame4D className="p-6" interactive={false}>
        {sent ? (
          <div className="text-sm" style={{ color: "var(--pq-text)" }}>{t("ctc.sent")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label>{t("ctc.your_email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ae" />
            </div>
            <div className="sm:col-span-2">
              <label>{t("ctc.subject")}</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label>{t("ctc.message")}</label>
              <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {error && (
              <div
                className="sm:col-span-2 rounded-xl px-3 py-2 text-sm"
                style={{ background: "rgba(239,68,68,0.10)", color: "#7f1d1d", border: "1px solid rgba(239,68,68,0.20)" }}
              >
                {t("wiz.error")}: {error}
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <button
                ref={sendBtnRef}
                disabled={sending || !email || !subject || !message}
                onClick={submit}
                className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill"
              >
                {sending ? t("ctc.sending") : t("ctc.send")}
              </button>
            </div>
          </div>
        )}
      </Frame4D>
    </div>
  );
}
