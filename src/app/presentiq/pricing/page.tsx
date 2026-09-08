import type { Metadata } from "next";
import { Pricing } from "./Pricing";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.pitchora.ai";
const CANONICAL = `${APP_URL}/presentiq/pricing`;
const TITLE = "Pricing";
const DESCRIPTION =
  "Pitchora pricing. Start free, upgrade to Pro at $49/mo, Business at $199/mo, or contact us for Enterprise and Government Private Deployment. Every plan ships editable PPTX, native Arabic RTL, and the 10-dimension readiness score.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL, languages: { "en-US": CANONICAL, "ar-AE": CANONICAL } },
  openGraph: { title: `${TITLE} · Pitchora`, description: DESCRIPTION, url: CANONICAL, type: "website" },
  twitter: { title: `${TITLE} · Pitchora`, description: DESCRIPTION, card: "summary_large_image" },
};

/**
 * FAQPage structured data — mirrors the six billing/security FAQ items
 * rendered on the page. This lets Google AI Overviews, Bing Copilot,
 * and ChatGPT search pull the answers verbatim and surface them under
 * the Pitchora brand instead of paraphrasing us.
 */
const pricingFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I cancel my Pitchora subscription anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No long-term contracts. Cancel anytime in the billing portal.",
      },
    },
    {
      "@type": "Question",
      name: "Is my content secure on Pitchora?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Per-tenant storage prefixes, secure storage, short-lived signed URLs, and a full audit log.",
      },
    },
    {
      "@type": "Question",
      name: "How fast is a plan upgrade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instant. Stripe-billed. Features unlock within seconds of a successful payment.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods does Pitchora accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Visa, Mastercard, and American Express through Stripe. Enterprise plans can pay by bank transfer or purchase order.",
      },
    },
    {
      "@type": "Question",
      name: "Does Pitchora offer a money-back guarantee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Full refund within 14 days on any paid plan. No questions asked.",
      },
    },
    {
      "@type": "Question",
      name: "Can I change plans later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Upgrades apply immediately. Downgrades take effect at the next billing cycle.",
      },
    },
  ],
};

/**
 * Product-with-Offers structured data. Prices below match the four
 * tiers on the page (Trial 0, Pro 49, Business 199, Enterprise POA).
 */
const pricingProductJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Pitchora",
  description:
    "AI boardroom presentation studio. Editable PPTX, brand governance, evidence-controlled content, native Arabic RTL.",
  brand: { "@type": "Brand", name: "Pitchora" },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "199",
    offerCount: 4,
    offers: [
      { "@type": "Offer", name: "Trial",      price: "0",   priceCurrency: "USD", availability: "https://schema.org/InStock" },
      { "@type": "Offer", name: "Pro",        price: "49",  priceCurrency: "USD", availability: "https://schema.org/InStock" },
      { "@type": "Offer", name: "Business",   price: "199", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      { "@type": "Offer", name: "Enterprise", price: "0",   priceCurrency: "USD", availability: "https://schema.org/InStock", eligibleQuantity: { "@type": "QuantitativeValue", value: 1 } },
    ],
  },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingProductJsonLd) }}
      />
      <Pricing />
    </>
  );
}
