import type { Metadata } from "next";
import { TemplatesGallery } from "./Gallery";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.pitchora.ai";
const CANONICAL = `${APP_URL}/presentiq/templates`;
const TITLE = "Templates";
const DESCRIPTION =
  "Nine boardroom-ready Pitchora templates: SCQA executive brief, boardroom decision, RACI QBR steering, investor business case, OKR review, PESTEL strategy, government committee, training module, and tender response. Each ships with framework, slide count, duration, and full outline.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL, languages: { "en-US": CANONICAL, "ar-AE": CANONICAL } },
  openGraph: { title: `${TITLE} · Pitchora`, description: DESCRIPTION, url: CANONICAL, type: "website" },
  twitter: { title: `${TITLE} · Pitchora`, description: DESCRIPTION, card: "summary_large_image" },
};

export default function TemplatesPage() {
  return <TemplatesGallery />;
}
