"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useT, useI18n } from "@/lib/i18n/I18nProvider";
import { LEARN_COURSES, LEARN_LEVELS, type LearnCourse } from "@/lib/learn-courses";

export const dynamic = "force-dynamic";

/**
 * Master AI — free, open YouTube courses curated by topic and level.
 *
 * Inspired by the "Master AI" pattern in similar platforms but with a hard
 * rule: only links to free, reputable content (DeepLearning.AI, Anthropic,
 * freeCodeCamp, Google, Microsoft, Karpathy). No paywalls, no affiliates.
 */
export default function LearnPage() {
  const t = useT();
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [level, setLevel] = useState<"all" | typeof LEARN_LEVELS[number]>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEARN_COURSES.filter((c) => {
      if (level !== "all" && c.level !== level) return false;
      if (!q) return true;
      const hay = (c.title_en + " " + c.title_ar + " " + c.blurb_en + " " + c.blurb_ar + " " + c.author + " " + c.topics.join(" ")).toLowerCase();
      return hay.includes(q);
    });
  }, [level, query]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {isAr ? "تعلَّم هندسة الموجِّهات" : "Master prompt engineering"}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
          {isAr
            ? "دورات يوتيوب مفتوحة ومجانيّة من أفضل المصادر العالمية. كلّها بلا رسوم وبلا روابط دعائية."
            : "Free, open YouTube courses from the best sources in the world. No paywalls, no affiliate links."}
        </p>
      </header>

      <div className="mt-5 flex flex-wrap gap-2 items-center">
        <input
          type="search"
          placeholder={isAr ? "ابحث عن موضوع، أو ChatGPT أو Claude…" : "Search topic, ChatGPT, Claude…"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[180px]"
        />
        <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 p-0.5 text-xs">
          {(["all", ...LEARN_LEVELS] as const).map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              aria-pressed={level === lv}
              className={
                "px-3 py-1 rounded-full transition " +
                (level === lv
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 dark:text-slate-300")
              }
            >
              {labelLevel(lv, isAr)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {visible.map((c) => (
          <CourseCard key={c.id} course={c} isAr={isAr} />
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
            {isAr ? "لا توجد دورات تطابق بحثك." : "No courses match your search."}
          </p>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-500 dark:text-slate-400">
        {isAr
          ? "اقتراح دورة جديدة؟ راسلنا من "
          : "Want to suggest a new course? Reach us from "}
        <Link href="/settings" className="text-brand-700 dark:text-brand-300 hover:underline">
          {isAr ? "صفحة الإعدادات" : "the Settings page"}
        </Link>.
      </p>
    </div>
  );
}

function labelLevel(lv: "all" | "beginner" | "intermediate" | "advanced", isAr: boolean) {
  if (lv === "all")          return isAr ? "الكل" : "All";
  if (lv === "beginner")     return isAr ? "مبتدئ" : "Beginner";
  if (lv === "intermediate") return isAr ? "متوسط" : "Intermediate";
  return isAr ? "متقدّم" : "Advanced";
}

function CourseCard({ course, isAr }: { course: LearnCourse; isAr: boolean }) {
  const levelTone =
    course.level === "beginner"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : course.level === "intermediate"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";

  return (
    <a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex flex-col h-full hover:shadow-md transition group"
    >
      <div className="flex items-center gap-2 flex-wrap text-[11px]">
        <span className={"px-2 py-0.5 rounded " + levelTone}>
          {labelLevel(course.level, isAr)}
        </span>
        <span className="text-slate-500 dark:text-slate-400 tabular-nums">⏱ {course.duration}</span>
        <span className="text-slate-500 dark:text-slate-400">· {course.author}</span>
      </div>
      <h3 className="mt-2 text-base font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition">
        {isAr ? course.title_ar : course.title_en}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 flex-1">
        {isAr ? course.blurb_ar : course.blurb_en}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {course.topics.map((t) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 text-xs text-brand-700 dark:text-brand-300 inline-flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.582 6.186a2.506 2.506 0 0 0-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418A2.506 2.506 0 0 0 2.418 6.186C2 7.746 2 11 2 11s0 3.254.418 4.814a2.506 2.506 0 0 0 1.768 1.768C5.746 18 12 18 12 18s6.254 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768C22 14.254 22 11 22 11s0-3.254-.418-4.814zM10 14V8l5.2 3-5.2 3z"/>
        </svg>
        {isAr ? "افتح في YouTube" : "Open on YouTube"}
      </div>
    </a>
  );
}
