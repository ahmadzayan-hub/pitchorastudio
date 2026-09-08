/**
 * BCP-47 voice locales with country flags and labels.
 *
 * The Web Speech API accepts a BCP-47 tag (e.g. "ar-EG", "en-GB"); browsers
 * pick the matching recognition model. We expose a curated list — flag-first
 * so it scans visually — and remember the user's last choice in localStorage.
 *
 * Default for Arabic is **🇪🇬 ar-EG** because it has the broadest media
 * exposure in Arab speech datasets and recognises well across most dialects.
 * MSA is intentionally not in the menu; users who want it pick the dialect
 * closest to their speech.
 */

export interface VoiceLocale {
  code: string;
  flag: string;
  ar: string;
  en: string;
}

export const VOICE_LOCALES_AR: VoiceLocale[] = [
  { code: "ar-EG", flag: "🇪🇬", ar: "مصر",        en: "Egypt" },
  { code: "ar-AE", flag: "🇦🇪", ar: "الإمارات",   en: "UAE" },
  { code: "ar-SA", flag: "🇸🇦", ar: "السعودية",   en: "Saudi Arabia" },
  { code: "ar-KW", flag: "🇰🇼", ar: "الكويت",     en: "Kuwait" },
  { code: "ar-QA", flag: "🇶🇦", ar: "قطر",        en: "Qatar" },
  { code: "ar-BH", flag: "🇧🇭", ar: "البحرين",   en: "Bahrain" },
  { code: "ar-OM", flag: "🇴🇲", ar: "عُمان",      en: "Oman" },
  { code: "ar-JO", flag: "🇯🇴", ar: "الأردن",     en: "Jordan" },
  { code: "ar-PS", flag: "🇵🇸", ar: "فلسطين",     en: "Palestine" },
  { code: "ar-LB", flag: "🇱🇧", ar: "لبنان",      en: "Lebanon" },
  { code: "ar-SY", flag: "🇸🇾", ar: "سوريا",      en: "Syria" },
  { code: "ar-IQ", flag: "🇮🇶", ar: "العراق",     en: "Iraq" },
  { code: "ar-YE", flag: "🇾🇪", ar: "اليمن",      en: "Yemen" },
  { code: "ar-SD", flag: "🇸🇩", ar: "السودان",   en: "Sudan" },
  { code: "ar-MA", flag: "🇲🇦", ar: "المغرب",    en: "Morocco" },
  { code: "ar-DZ", flag: "🇩🇿", ar: "الجزائر",   en: "Algeria" },
  { code: "ar-TN", flag: "🇹🇳", ar: "تونس",       en: "Tunisia" },
  { code: "ar-LY", flag: "🇱🇾", ar: "ليبيا",      en: "Libya" }
];

export const VOICE_LOCALES_EN: VoiceLocale[] = [
  { code: "en-US", flag: "🇺🇸", ar: "الولايات المتحدة", en: "United States" },
  { code: "en-GB", flag: "🇬🇧", ar: "المملكة المتحدة",  en: "United Kingdom" },
  { code: "en-AU", flag: "🇦🇺", ar: "أستراليا",          en: "Australia" },
  { code: "en-CA", flag: "🇨🇦", ar: "كندا",              en: "Canada" },
  { code: "en-IN", flag: "🇮🇳", ar: "الهند",             en: "India" }
];

const KEY_AR = "po_voice_locale_ar";
const KEY_EN = "po_voice_locale_en";

export function defaultFor(uiLocale: "en" | "ar"): VoiceLocale {
  return uiLocale === "ar" ? VOICE_LOCALES_AR[0] : VOICE_LOCALES_EN[0];
}

export function listFor(uiLocale: "en" | "ar"): VoiceLocale[] {
  return uiLocale === "ar" ? VOICE_LOCALES_AR : VOICE_LOCALES_EN;
}

export function loadPreferred(uiLocale: "en" | "ar"): VoiceLocale {
  if (typeof window === "undefined") return defaultFor(uiLocale);
  try {
    const key = uiLocale === "ar" ? KEY_AR : KEY_EN;
    const code = window.localStorage.getItem(key);
    const list = listFor(uiLocale);
    return list.find((v) => v.code === code) ?? defaultFor(uiLocale);
  } catch {
    return defaultFor(uiLocale);
  }
}

export function savePreferred(uiLocale: "en" | "ar", v: VoiceLocale): void {
  if (typeof window === "undefined") return;
  try {
    const key = uiLocale === "ar" ? KEY_AR : KEY_EN;
    window.localStorage.setItem(key, v.code);
  } catch {
    /* ignore */
  }
}

export function labelFor(v: VoiceLocale, uiLocale: "en" | "ar"): string {
  return uiLocale === "ar" ? v.ar : v.en;
}
