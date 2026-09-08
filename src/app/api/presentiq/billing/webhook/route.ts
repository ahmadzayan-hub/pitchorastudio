import { NextResponse } from "next/server";
import { getServiceRoleSupabase, writeAudit } from "@/lib/presentiq";
import { getStripe, isStripeConfigured } from "@/lib/presentiq/stripe/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const stripe = getStripe();
  const buf = Buffer.from(await req.arrayBuffer());
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: "invalid_signature", detail: (e as Error).message }, { status: 400 });
  }

  const supabase = await getServiceRoleSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as any;
        const orgId = s.metadata?.organization_id;
        const plan = s.metadata?.plan ?? "pro";
        if (orgId) {
          await supabase.from("pq_subscriptions").upsert(
            {
              organization_id: orgId,
              plan,
              status: "active",
              provider: "stripe",
              external_customer_id: s.customer as string,
              external_subscription_id: s.subscription as string,
            },
            { onConflict: "organization_id" },
          );
          await supabase.from("pq_organizations").update({ plan }).eq("id", orgId);
          await writeAudit(supabase, {
            organization_id: orgId,
            action: "billing.checkout.completed",
            object_type: "subscription",
            metadata: { plan, session_id: s.id },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const s = event.data.object as any;
        const orgId = s.metadata?.organization_id;
        if (orgId) {
          await supabase
            .from("pq_subscriptions")
            .update({
              status: s.status,
              current_period_end: s.current_period_end
                ? new Date(s.current_period_end * 1000).toISOString()
                : null,
            })
            .eq("organization_id", orgId);
          await writeAudit(supabase, {
            organization_id: orgId,
            action: `billing.${event.type}`,
            object_type: "subscription",
            metadata: { status: s.status },
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as any;
        const orgId = inv.subscription_details?.metadata?.organization_id;
        if (orgId) {
          await supabase.from("pq_subscriptions").update({ status: "past_due" }).eq("organization_id", orgId);
          await writeAudit(supabase, {
            organization_id: orgId,
            action: "billing.invoice.payment_failed",
            object_type: "subscription",
            metadata: { invoice_id: inv.id },
          });
        }
        break;
      }
    }
  } catch (e) {
    return NextResponse.json({ error: "handler_error", detail: (e as Error).message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
