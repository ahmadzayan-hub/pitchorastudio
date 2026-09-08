"use client";

import { useI18n } from "@/lib/presentiq/i18n/context";

export function LangToggle() {
  const { lang, toggleLang } = useI18n();
  return (
    <button
      onClick={toggleLang}
      type="button"
      className="pq-btn-ghost pq-btn"
      style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
      title={lang === "en" ? "تبديل إلى العربية" : "Switch to English"}
    >
      <span aria-hidden>🌐</span>
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}
