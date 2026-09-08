import type { Metadata } from "next";
import { About } from "./About";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.pitchora.ai";
const CANONICAL = `${APP_URL}/presentiq/about`;
const TITLE = "About";
const DESCRIPTION =
  "Why Pitchora exists, who built it, and what the name means. Pitch + Aurora: the studio that closes the gap between a rough idea and a boardroom-ready deck. Built in the UAE by Zaian for consulting firms, government committees, and executive boardrooms.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL, languages: { "en-US": CANONICAL, "ar-AE": CANONICAL } },
  openGraph: { title: `${TITLE} · Pitchora`, description: DESCRIPTION, url: CANONICAL, type: "website" },
  twitter: { title: `${TITLE} · Pitchora`, description: DESCRIPTION, card: "summary_large_image" },
};

/** Organization schema. Links Pitchora as a real business entity with
 *  its founder, publisher, and area served. Search engines and LLMs
 *  use this to build the sidebar knowledge card. */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${APP_URL}#organization`,
  name: "Pitchora",
  alternateName: ["Pitchora AI", "Pitchora by Zaian", "بِتشورا"],
  url: APP_URL,
  logo: `${APP_URL}/icon.svg`,
  description: DESCRIPTION,
  foundingDate: "2025",
  foundingLocation: { "@type": "Place", name: "United Arab Emirates" },
  areaServed: ["AE", "SA", "QA", "BH", "KW", "OM", "EG", "JO", "UK", "US"],
  knowsLanguage: ["en", "ar"],
  parentOrganization: { "@type": "Organization", name: "Zaian" },
  sameAs: [
    "https://www.linkedin.com/company/pitchora",
    "https://x.com/pitchora",
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <About />
    </>
  );
}
