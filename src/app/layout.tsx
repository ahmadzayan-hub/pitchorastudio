import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.pitchora.ai";
const TITLE = "Pitchora | AI Boardroom Presentation Studio · استوديو العروض الذكيّة";
const DESCRIPTION =
  "Pitchora is the AI studio that turns a rough idea into a boardroom-ready deck in minutes. Brand-governed, evidence-controlled, editable PPTX out, with native Arabic RTL support and a 10-dimension readiness score. Built in the UAE for executives and government committees. بِتشورا: استوديو ذكاء اصطناعي يحوّل الفكرة إلى عرضٍ جاهز لمجلس الإدارة في دقائق، بدعم عربي أصيل من اليمين إلى اليسار.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · Pitchora" },
  description: DESCRIPTION,
  applicationName: "Pitchora",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pitchora", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
  authors: [{ name: "Pitchora", url: APP_URL }],
  creator: "Pitchora by Zaian",
  publisher: "Pitchora",
  category: "productivity",
  formatDetection: { telephone: false, email: false, address: false },
  keywords: [
    // Product & brand
    "Pitchora", "Pitchora AI", "بِتشورا",
    // Core product terms
    "AI presentation", "boardroom deck", "executive presentation", "PPTX generator",
    "AI slide generator", "pitch deck AI", "presentation AI agent",
    // Arabic + RTL
    "Arabic RTL slides", "bilingual presentations", "عروض تقديمية بالذكاء الاصطناعي",
    "عرض تنفيذي", "عرض مجلس إدارة", "شرائح عربية", "استوديو عروض",
    // Enterprise angles
    "brand governance", "evidence-controlled AI", "corporate presentations",
    "consulting deck", "government committee deck", "board readiness score",
    // Regional
    "UAE SaaS", "Dubai AI startup", "MENA AI presentations",
  ],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "Pitchora",
    locale: "en_US",
    alternateLocale: ["ar_AE", "ar_SA"],
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pitchora, AI boardroom presentation studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
    site: "@pitchora",
    creator: "@pitchora",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
    languages: { "en-US": APP_URL, "ar-AE": APP_URL },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6ff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0a0e2a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload the two Arabic display files so switching language
            to AR does not flash unstyled text (FOUT). Two weights are
            enough for the marketing hero and body; the rest come from
            the same stylesheet. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="https://fonts.gstatic.com/s/tajawal/v11/Iurf6YBj_oCad4k1nzGBC5xLhLE.woff2"
        />
        {/* Curated EN + AR font stack used both on the marketing UI and as
            preview fonts in the Brand Kit / slide editor. Kept on a single
            CSS request so we hit one round-trip; subset to the weights the
            UI actually uses. */}
        <link
          href={
            "https://fonts.googleapis.com/css2" +
            "?family=Inter:wght@400;500;600;700;800" +
            "&family=Manrope:wght@400;500;600;700;800" +
            "&family=Source+Sans+3:wght@400;500;600;700" +
            "&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400" +
            "&family=Playfair+Display:wght@400;600;700;800" +
            "&family=Merriweather:wght@400;700" +
            "&family=IBM+Plex+Sans:wght@400;500;600;700" +
            "&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700" +
            "&family=Tajawal:wght@400;500;700;800" +
            "&family=Cairo:wght@400;500;600;700;800" +
            "&family=Amiri:ital,wght@0,400;0,700;1,400" +
            "&family=Amiri+Quran" +
            "&family=Noto+Naskh+Arabic:wght@400;500;700" +
            "&family=Noto+Kufi+Arabic:wght@400;500;700" +
            "&family=Scheherazade+New:wght@400;700" +
            "&family=Lateef:wght@400;700" +
            "&display=swap"
          }
          rel="stylesheet"
        />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='tz_theme',v=localStorage.getItem(k);var d=v==='dark'||((v===null||v==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:text-brand-700 focus:font-medium"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Tweenz AI Learning OS",
              alternateName: ["Tweenz AI", "منصة Tweenz التعليمية"],
              description: DESCRIPTION,
              url: APP_URL,
              applicationCategory: "EducationApplication",
              operatingSystem: "Any",
              countryOfOrigin: { "@type": "Country", name: "United Arab Emirates" },
              offers: [
                { "@type": "Offer", name: "Free Plan", price: "0", priceCurrency: "USD" },
                { "@type": "Offer", name: "Student Plan", price: "12", priceCurrency: "USD" },
              ],
              inLanguage: ["en", "ar"],
              audience: { "@type": "Audience", audienceType: "MBA and university students" }
            })
          }}
        />
        <I18nProvider>
          {children}
        </I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}`
          }}
        />
      </body>
    </html>
  );
}
