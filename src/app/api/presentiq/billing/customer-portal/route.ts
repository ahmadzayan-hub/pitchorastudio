import { getRequestContext, getSupabase } from "@/lib/presentiq";
import { getStripe, isStripeConfigured } from "@/lib/presentiq/stripe/client";
import { fail, json, unauthorized } from "@/lib/presentiq/api/response";

export async function POST(req: Request) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  if (!["owner", "admin"].includes(ctx.role)) return fail("forbidden", "owner/admin only", 403);
  if (!isStripeConfigured()) return fail("stripe_not_configured", "Stripe not configured", 503);

  const supabase = await getSupabase();
  const { data: sub } = await supabase
    .from("pq_subscriptions")
    .select("external_customer_id")
    .eq("organization_id", ctx.orgId)
    .maybeSingle();
  if (!sub?.external_customer_id) return fail("no_customer", "No Stripe customer", 400);

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.external_customer_id,
    return_url: `${origin}/presentiq/billing`,
  });
  return json({ url: portal.url });
}
