"use client";

import { useId, useMemo } from "react";
import { useT, useI18n } from "@/lib/i18n/I18nProvider";
import { groupedModels, getModel, CATEGORY_LABELS, type ModelCategory } from "@/lib/ai-models";

interface Props {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

const CATEGORY_ORDER: ModelCategory[] = ["text", "code", "image", "video", "audio"];

/**
 * Grouped model picker with vendor + flagship hint.
 *
 * Native <select> with <optgroup> so it scrolls and searches with the OS
 * picker on every platform (Android dropdown, iOS wheel, desktop list).
 * The chosen model's "what it's good at" note is shown beneath the picker
 * so the user knows why this prompt format makes sense.
 */
export default function ModelPicker({ value, onChange, className }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const id = useId();
  const groups = useMemo(() => groupedModels(), []);
  const active = getModel(value);

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm shrink-0 block mb-1">
        {t("ws.target")}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      >
        {CATEGORY_ORDER.map((cat) => (
          <optgroup
            key={cat}
            label={`${CATEGORY_LABELS[cat].emoji} ${isAr ? CATEGORY_LABELS[cat].ar : CATEGORY_LABELS[cat].en}`}
          >
            {groups[cat].map((m) => (
              <option key={m.id} value={m.id}>
                {m.flagship ? "★ " : ""}{m.name}
                {m.vendor === "—" ? "" : ` · ${m.vendor}`}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {active && active.id !== "generic" && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {isAr ? active.notes_ar : active.notes_en}
        </p>
      )}
    </div>
  );
}
