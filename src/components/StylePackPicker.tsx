"use client";

import { useT, useI18n } from "@/lib/i18n/I18nProvider";
import { IMAGE_STYLE_PACKS, styleAppendLine } from "@/lib/image-styles";

interface Props {
  onPick: (appended: string, label: string) => void;
  className?: string;
}

/**
 * Tap a flag-pack to append its visual modifiers to the raw prompt.
 *
 * Visible only when the workspace is on the `image` intent. The picker is
 * non-destructive — it adds a "## Visual style" section; users can edit or
 * remove it before generating.
 */
export default function StylePackPicker({ onPick, className }: Props) {
  const t = useT();
  const { locale } = useI18n();

  return (
    <div className={"mt-2 " + (className ?? "")}>
      <div className="text-xs text-slate-500 mb-1.5">{t("style.pick")}</div>
      <div className="flex flex-wrap gap-1.5">
        {IMAGE_STYLE_PACKS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() =>
              onPick(styleAppendLine(p, locale), locale === "ar" ? p.ar : p.en)
            }
            className="text-[11px] px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:text-brand-700 transition inline-flex items-center gap-1"
          >
            <span aria-hidden="true">{p.emoji}</span>
            <span>{locale === "ar" ? p.ar : p.en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
