/**
 * Stripe plan registry — single source of truth.
 *
 * Stripe price IDs come from environment variables so the same code-base
 * works in test and live mode.
 */

export type PlanCode = "trial" | "pro" | "business" | "enterprise" | "gov_private";

export type PresentIqPlan = {
  code: PlanCode;
  name: string;
  monthlyPriceId?: string;
  annualPriceId?: string;
  monthlyUsd: number;
  annualUsd: number;
  decksPerMonth: number | null;
  brandKits: number | null;
  aiCredits: number | null;
  storageMb: number | null;
  features: string[];
};

export const PLANS: PresentIqPlan[] = [
  {
    code: "trial",
    name: "Free Trial",
    monthlyUsd: 0,
    annualUsd: 0,
    decksPerMonth: 3,
    brandKits: 1,
    aiCredits: 5_000,
    storageMb: 200,
    features: ["7-day trial", "All MVP features"],
  },
  {
    code: "pro",
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL,
    monthlyUsd: 49,
    annualUsd: 470,
    decksPerMonth: 50,
    brandKits: 3,
    aiCredits: 50_000,
    storageMb: 5_120,
    features: ["Editable PPTX", "Bilingual decks", "Up to 3 brand kits"],
  },
  {
    code: "business",
    name: "Business",
    monthlyPriceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
    monthlyUsd: 199,
    annualUsd: 1_910,
    decksPerMonth: 250,
    brandKits: 25,
    aiCredits: 250_000,
    storageMb: 51_200,
    features: ["OIDC SSO", "Approval workflow", "Audit log export"],
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyUsd: 0,
    annualUsd: 0,
    decksPerMonth: null,
    brandKits: null,
    aiCredits: 2_000_000,
    storageMb: 512_000,
    features: ["SAML/MFA", "DLP-ready", "Custom DPA", "Dedicated support"],
  },
  {
    code: "gov_private",
    name: "Government Private Deployment",
    monthlyUsd: 0,
    annualUsd: 0,
    decksPerMonth: null,
    brandKits: null,
    aiCredits: null,
    storageMb: null,
    features: ["UAE-hosted", "Private model", "Customer-managed keys"],
  },
];

export function getPlan(code: PlanCode): PresentIqPlan | undefined {
  return PLANS.find((p) => p.code === code);
}
