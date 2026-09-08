"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

interface Props {
  className?: string;
}

/**
 * Wordmark for the platform brand.
 *
 * - English: **ZAIan Studio** — the "ZAI" tri-letter is rendered in the
 *   brand gradient to read "Z-A-I" (the AI half of the name).
 * - Arabic:  **زيان ستوديو**.
 *
 * The component picks the right form based on the active locale, but always
 * renders the *other* form as a small subtitle so both audiences recognise
 * the platform.
 */
export default function Wordmark({ className }: Props) {
  const { locale } = useI18n();

  // The English wordmark: "ZAI" tri-letter rendered in the brand gradient
  // with explicit `tracking-wide` so the capital "I" stays visually distinct
  // from a lowercase "l" in the system sans-serif. Studio sits separately so
  // the brand reads as two words at every size.
  const en = (
    <span className="font-bold tracking-tight">
      <span className="text-brand-600 dark:text-brand-300 tracking-wider">ZAI</span>an{" "}
      <span className="font-semibold text-slate-700 dark:text-slate-200">Studio</span>
    </span>
  );
  const ar = (
    <span className="font-semibold tracking-tight">
      زيان ستوديو
    </span>
  );

  return (
    <span className={"flex flex-col leading-tight min-w-0 " + (className ?? "")}>
      <span className="text-base sm:text-lg truncate">
        {locale === "ar" ? ar : en}
      </span>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate" aria-hidden="true">
        {locale === "ar" ? "ZAIan Studio" : "زيان ستوديو"}
      </span>
    </span>
  );
}
