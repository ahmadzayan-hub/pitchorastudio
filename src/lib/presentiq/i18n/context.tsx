"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TRANSLATIONS, type Lang, type TKey } from "./translations";

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: TKey) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "pq_lang";

export function I18nProvider({ children, initial = "en" }: { children: ReactNode; initial?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initial);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ar") setLangState(saved);
    } catch {}
  }, []);

  // Sync html dir + lang attributes whenever language changes.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const toggleLang = useCallback(() => setLang(lang === "en" ? "ar" : "en"), [lang, setLang]);

  const tFn = useCallback((key: TKey) => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] ?? entry.en;
  }, [lang]);

  const value = useMemo<Ctx>(() => ({
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    setLang,
    toggleLang,
    t: tFn,
  }), [lang, setLang, toggleLang, tFn]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) {
    // Soft fallback so server-rendered components don't crash if used outside provider.
    return {
      lang: "en",
      dir: "ltr",
      setLang: () => {},
      toggleLang: () => {},
      t: (key: TKey) => TRANSLATIONS[key]?.en ?? key,
    };
  }
  return ctx;
}
