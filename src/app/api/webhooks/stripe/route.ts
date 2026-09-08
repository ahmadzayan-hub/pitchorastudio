import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe/client";
import Stripe from "stripe";

const serviceSupabase = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: { getAll: () => [], setAll: () => {} } }
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = serviceSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan ?? "student";
      if (!userId) break;
      const customerId = session.customer as string;
      const subId = session.subscription as string;
      const sub = await getStripe().subscriptions.retrieve(subId);
      const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
      await supabase.from("subscriptions").upsert({
        user_id: userId, plan, status: sub.status,
        stripe_customer_id: customerId, stripe_sub_id: subId,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        ai_queries_limit: plan === "pro" ? 2000 : 500,
      }, { onConflict: "user_id" });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
      const { data: existing } = await supabase.from("subscriptions").select("user_id").eq("stripe_sub_id", sub.id).single();
      if (existing) {
        await supabase.from("subscriptions").update({
          status: sub.status,
          current_period_end: new Date(periodEnd * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        }).eq("stripe_sub_id", sub.id);
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string;
        payment_intent?: string;
      };
      if (invoice.subscription) {
        const sub = await getStripe().subscriptions.retrieve(invoice.subscription);
        const { data: existing } = await supabase.from("subscriptions").select("user_id").eq("stripe_sub_id", sub.id).single();
        if (existing) {
          await supabase.from("subscriptions").update({ status: "active", ai_queries_used: 0 }).eq("stripe_sub_id", sub.id);
          await supabase.from("payments").insert({
            user_id: existing.user_id,
            stripe_payment_id: invoice.payment_intent ?? null,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "succeeded",
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
