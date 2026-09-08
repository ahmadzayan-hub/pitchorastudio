"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email") }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || t("error.generic")); return; }
      setSent(true);
    } catch { setError(t("error.network")); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card-lg p-8">
      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t("auth.reset.sent")}</h1>
          <p className="text-sm text-slate-500 mb-6">Check your inbox for the password reset link.</p>
          <Link href="/login" className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">
            {t("auth.reset.back")}
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("auth.reset.title")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("auth.reset.subtitle")}</p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("auth.reset.email")}</label>
              <input name="email" type="email" required placeholder="your@email.com" />
            </div>
            <Button type="submit" fullWidth loading={loading}>{t("auth.reset.submit")}</Button>
          </form>
          <p className="mt-5 text-center">
            <Link href="/login" className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400">{t("auth.reset.back")}</Link>
          </p>
        </>
      )}
    </div>
  );
}
