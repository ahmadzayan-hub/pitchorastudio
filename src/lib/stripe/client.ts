import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const PLANS = {
  student: {
    monthly: process.env.STRIPE_STUDENT_MONTHLY_PRICE_ID ?? "price_student_monthly",
    annual:  process.env.STRIPE_STUDENT_ANNUAL_PRICE_ID  ?? "price_student_annual",
    aiLimit: 500,
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_pro_monthly",
    annual:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID  ?? "price_pro_annual",
    aiLimit: 2000,
  },
} as const;
