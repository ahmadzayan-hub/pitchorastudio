"use client";

import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";

export default function Footer() {
  const t = useT();
  const { locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid sm:grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <div className="font-medium text-slate-700 dark:text-slate-200">{t("app.name")}</div>
          <p className="mt-1">{t("footer.note")}</p>
          <p className="mt-1 text-[11px]">© {year}</p>
        </div>
        <div className="sm:text-end">
          <div className="font-medium text-slate-700 dark:text-slate-200">{t("footer.contact_title")}</div>
          <p className="mt-1">
            <a
              href={CONTACT_MAILTO}
              className="text-brand-700 dark:text-brand-300 hover:underline break-all"
              aria-label={locale === "ar" ? `راسلنا على ${CONTACT_EMAIL}` : `Email us at ${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-1">{t("footer.contact_note")}</p>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 sm:justify-end text-[11px]">
            <a href="/privacy" className="text-brand-700 dark:text-brand-300 hover:underline">
              {locale === "ar" ? "سياسة الخصوصية" : "Privacy policy"}
            </a>
            <a href="/learn" className="text-brand-700 dark:text-brand-300 hover:underline">
              {locale === "ar" ? "تعلَّم" : "Learn"}
            </a>
            <a href="/settings" className="text-brand-700 dark:text-brand-300 hover:underline">
              {locale === "ar" ? "الإعدادات" : "Settings"}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
