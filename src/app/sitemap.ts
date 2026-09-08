import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.pitchora.ai";

/**
 * Pitchora sitemap.
 *
 * Only lists public marketing pages. Authenticated app routes
 * (dashboard, projects, brand kits, etc.) are excluded on purpose so
 * crawlers do not chase auth-walled URLs and waste budget. Each entry
 * carries an alternates map so Google can serve the right locale from
 * the same URL (the app uses in-place EN/AR switching, not URL locales).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const marketing = [
    { path: "/presentiq",             pri: 1.0, freq: "weekly"  as const },
    { path: "/presentiq/pricing",     pri: 0.9, freq: "weekly"  as const },
    { path: "/presentiq/templates",   pri: 0.9, freq: "weekly"  as const },
    { path: "/presentiq/about",       pri: 0.8, freq: "monthly" as const },
    { path: "/presentiq/changelog",   pri: 0.7, freq: "weekly"  as const },
    { path: "/presentiq/contact",     pri: 0.6, freq: "yearly"  as const },
  ];
  return marketing.map(({ path, pri, freq }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    priority: pri,
    changeFrequency: freq,
    alternates: {
      languages: {
        "en-US": `${BASE}${path}`,
        "ar-AE": `${BASE}${path}`,
      },
    },
  }));
}
