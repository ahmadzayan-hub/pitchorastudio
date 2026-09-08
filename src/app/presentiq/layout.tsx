import { ReactNode } from "react";
import type { Metadata } from "next";
import { I18nProvider } from "@/lib/presentiq/i18n/context";
import { PresentIqShell } from "./_shell";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tweenz.ae";
const PITCHORA_URL = `${APP_URL.replace(/\/$/, "")}/presentiq`;
const TITLE = "Pitchora — From spark to boardroom-ready deck, in minutes";
const DESCRIPTION =
  "Pitchora by Zaian is the idea-to-deck studio: an AI agent platform that closes the gap between a half-formed idea and a polished, brand-governed, evidence-controlled, bilingual (Arabic-RTL) deck. Editable PPTX in minutes.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · Pitchora" },
  description: DESCRIPTION,
  applicationName: "Pitchora",
  keywords: [
    "Pitchora",
    "Pitchora AI",
    "idea to deck",
    "AI presentations",
    "boardroom presentations",
    "corporate slides",
    "PPTX generator",
    "brand governance",
    "evidence-controlled AI",
    "Arabic RTL slides",
    "bilingual presentations",
    "AI agent platform",
    "executive decks",
    "PowerPoint AI",
    "enterprise AI",
    "Pitch Aurora",
    "بِتشورا",
    "عروض تقديمية بالذكاء الاصطناعي",
  ],
  alternates: {
    canonical: PITCHORA_URL,
    languages: { en: PITCHORA_URL, ar: PITCHORA_URL },
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: PITCHORA_URL,
    siteName: "Pitchora",
    locale: "en_US",
    alternateLocale: ["ar_AE"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pitchora — From spark to boardroom-ready deck",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pitchora",
  alternateName: ["Pitchora AI", "Pitchora Agent Studio", "PresentIQ"],
  description: DESCRIPTION,
  url: PITCHORA_URL,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Presentation Software",
  operatingSystem: "Any",
  inLanguage: ["en", "ar"],
  isAccessibleForFree: true,
  featureList: [
    "Idea-to-deck AI pipeline",
    "Corporate brand governance",
    "Evidence-controlled content generation",
    "Editable PPTX export",
    "Arabic-English bilingual with RTL",
    "Boardroom storytelling templates",
    "10-dimension corporate quality scoring",
    "Per-slide regeneration",
    "Human review and approval workflow",
  ],
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "29", priceCurrency: "USD" },
    { "@type": "Offer", name: "Business", price: "99", priceCurrency: "USD" },
  ],
  audience: {
    "@type": "Audience",
    audienceType: "Executives, consultants, and corporate teams",
  },
  publisher: {
    "@type": "Organization",
    name: "Pitchora",
    url: PITCHORA_URL,
  },
};

export default function PresentIqLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider initial="en">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div data-pq data-pq-theme="dark" className="min-h-screen">
        {/* Pre-mount theme bootstrap — runs before React hydrates so the
            initial paint matches the persisted preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var v=localStorage.getItem('pq-theme');" +
              "if(v==='light'||v==='dark'){" +
              "document.querySelector('[data-pq]')?.setAttribute('data-pq-theme',v);" +
              "}}catch(e){}})();",
          }}
        />
        <PresentIqShell>{children}</PresentIqShell>
      </div>
    </I18nProvider>
  );
}
