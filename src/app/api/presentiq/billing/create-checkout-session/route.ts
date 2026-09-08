import { getRequestContext, getSupabase, getPlan } from "@/lib/presentiq";
import { getStripe, isStripeConfigured } from "@/lib/presentiq/stripe/client";
import { fail, json, unauthorized } from "@/lib/presentiq/api/response";

export async function POST(req: Request) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  if (!["owner", "admin"].includes(ctx.role)) return fail("forbidden", "owner/admin only", 403);
  if (!isStripeConfigured()) return fail("stripe_not_configured", "Stripe not configured", 503);

  const body = (await req.json().catch(() => ({}))) as { plan?: string; cycle?: "monthly" | "annual" };
  const plan = getPlan((body.plan ?? "pro") as any);
  if (!plan) return fail("invalid_plan", "unknown plan", 400);
  const priceId = body.cycle === "annual" ? plan.annualPriceId : plan.monthlyPriceId;
  if (!priceId) return fail("missing_price", `No Stripe price configured for ${plan.code}`, 400);

  const supabase = await getSupabase();
  const { data: sub } = await supabase
    .from("pq_subscriptions")
    .select("external_customer_id")
    .eq("organization_id", ctx.orgId)
    .maybeSingle();

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: sub?.external_customer_id ?? undefined,
    success_url: `${origin}/presentiq/billing?status=success&sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/presentiq/billing?status=cancelled`,
    metadata: { organization_id: ctx.orgId, plan: plan.code },
    subscription_data: { metadata: { organization_id: ctx.orgId, plan: plan.code } },
    allow_promotion_codes: true,
  });
  return json({ id: session.id, url: session.url });
}
