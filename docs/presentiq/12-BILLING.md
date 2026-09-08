# PresentIQ — Billing Architecture

## 1. Provider

**Stripe** for all web subscriptions. Apple IAP and Google Play Billing are post-MVP and only relevant if mobile apps sell subscriptions in-app.

## 2. Plans

| Plan | Stripe Product | Trial | Monthly | Annual |
|---|---|---|---|---|
| Free Trial | `prod_trial` | 7 days | 0 | 0 |
| Pro | `prod_pro` | 7 days | $49 | $470 |
| Business | `prod_business` | 7 days | $199 | $1,910 |
| Enterprise | `prod_enterprise` | n/a | quote | quote |
| Government Private | `prod_gov_private` | n/a | quote | quote |

Quantity is **seats**. AI credits and storage are tracked metered usage with monthly resets.

## 3. Flow

1. Org admin clicks Upgrade → API creates a Checkout Session.
2. Stripe Checkout redirects back with `session_id`.
3. Webhook `checkout.session.completed` → upsert `pq_subscriptions` row.
4. Webhook `customer.subscription.updated` / `.deleted` → mirror status.
5. Webhook `invoice.payment_failed` → set status `past_due`, soft-disable export.
6. Customer Portal opens via `/billing/customer-portal`.

## 4. Server Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/presentiq/billing/plan` | current plan + usage |
| POST | `/api/presentiq/billing/create-checkout-session` | new checkout |
| POST | `/api/presentiq/billing/customer-portal` | Stripe-hosted portal |
| POST | `/api/presentiq/billing/webhook` | Stripe events (signed) |

## 5. Usage Metering

Counters in `pq_organizations.settings.usage`:

```json
{
  "period_start": "2026-05-01",
  "decks_generated": 7,
  "ai_credits_used": 38422,
  "storage_bytes": 421889040,
  "exports": 12
}
```

Exceeding plan limits returns `plan_limit_exceeded` with the over-limit dimension.

## 6. Webhook Security

- Stripe signature verified via `STRIPE_WEBHOOK_SECRET`.
- Replay protection: idempotency by `stripe_event_id`.
- All events written to audit log.

## 7. Pricing Tier Implementation

`src/lib/presentiq/stripe/plans.ts` is the single source of truth. The seed migration loads matching `pq_plans` rows. Stripe product/price IDs live in env vars so the same code base works in test and live mode.

## 8. Enterprise & Government

- Quote-based; no public Checkout.
- Provisioned by support: a manual `pq_subscriptions` row + tenant flags.
- Government Private adds `region=uae` and a dedicated provider pool.
