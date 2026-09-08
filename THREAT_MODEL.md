# Pitchora Threat Model

Version 0.6.0 · Last reviewed 2026-07-06

This document is the STRIDE-style threat model for Pitchora at the
application + environment level. It exists so that:

1. Contributors know exactly which assets the app protects, where the
   trust boundaries sit, and what an attacker gets by breaking each
   one.
2. Reviewers can spot security regressions in a diff without having to
   re-derive the model.
3. Security auditors (internal and customer) can walk the codebase in
   one sitting.

Update this file when you add or move a trust boundary, when you
introduce a new asset type, or when you ship a control that closes a
gap called out below.

---

## 1. Assets (what we protect)

Ranked by impact of loss.

| # | Asset | Confidentiality | Integrity | Availability |
|---|-------|-----------------|-----------|--------------|
| A1 | Customer deck content (prompts, sources, generated slides, brand kits, uploaded logos) | High | High | Medium |
| A2 | Customer PII (email, display name, organisation, role) | High | Medium | Low |
| A3 | Auth session cookies (`sb-*` Supabase JWTs) | High | High | Low |
| A4 | Stripe billing state (subscription, plan, external_customer_id) | Medium | High | Medium |
| A5 | Supabase service-role key + OpenAI / Anthropic / Ollama keys | Critical | Critical | N/A |
| A6 | Audit log (`pq_audit_log`) — tamper-evident record of privileged actions | Medium | High | Medium |
| A7 | Marketing pages + SEO surface (landing, pricing, about, templates) | Low | High | Medium |
| A8 | Service worker + PWA install path (client-side) | Low | High | Medium |

---

## 2. Trust boundaries

```
                                Untrusted
                                    │
                          ┌─────────▼──────────┐
                          │  Public internet   │
                          └─────────┬──────────┘
                                    │
   ┌────────────────────────────────▼───────────────────────────────┐
   │  Vercel Edge  (TLS termination, rate limits, DDoS scrubbing)   │
   └────────────────────────────────┬───────────────────────────────┘
                                    │
              ┌─────────────────────┴─────────────────────┐
              │                                           │
     ┌────────▼─────────┐                       ┌─────────▼────────┐
     │ Marketing pages  │                       │  App shell +     │
     │  (SEO-indexed)   │                       │  serverless API  │
     │  no auth needed  │                       │  runtime=nodejs  │
     └──────────────────┘                       └─────────┬────────┘
                                                          │
                                        ┌─────────────────┼─────────────────┐
                                        │                 │                 │
                              ┌─────────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
                              │  Supabase Auth │  │  Postgres    │  │  Stripe API  │
                              │  (JWT cookies) │  │  (RLS-gated) │  │  (webhooks)  │
                              └────────────────┘  └──────────────┘  └──────────────┘
                                                          │
                                                ┌─────────▼─────────┐
                                                │  LLM providers    │
                                                │  (OpenAI / Anthr. │
                                                │  / Ollama)        │
                                                └───────────────────┘
```

Trust boundaries (each is a place an attacker can pivot):

- **B1** Public internet → Vercel Edge. Attacker controls headers,
  body, method, cookies, and can send unlimited requests up to Vercel
  quotas.
- **B2** Edge → Next.js runtime. Middleware refreshes Supabase session
  on every request. Requests without a valid session are still allowed
  to reach the route handler, which decides for itself.
- **B3** Route handler → Supabase. Row-Level Security (RLS) on every
  `pq_*` table gates by `organization_id` derived from the JWT.
- **B4** Route handler → LLM provider. Server-only env vars. Never
  exposed to client.
- **B5** Stripe → route handler (webhook). Signature-verified with
  `STRIPE_WEBHOOK_SECRET`. No other authenticator.
- **B6** Browser → client bundle. `NEXT_PUBLIC_*` env vars are inlined
  and world-readable. Only anon Supabase URL + publishable key belong
  here.

---

## 3. Data flow — new-presentation happy path

```
User → landing composer  ─┐
                          │ prompt, slide count, mode
                          ▼
              /presentiq/projects/new  (client component)
                          │
                          │ POST /api/presentiq/projects
                          ▼
                 route.ts (nodejs runtime)
                          │
                    ┌─────┴─────┐
              getUser()      RLS insert
                          │
                          ▼
             Supabase Postgres (pq_projects)
                          │
                          │ id
                          ▼
            /presentiq/projects/[id] page
                          │
                          │ generate blueprint
                          ▼
              /api/presentiq/projects/[id]/blueprint
                          │
                          │ LLM call (server-only key)
                          ▼
                 OpenAI / Anthropic / Ollama
                          │
                          │ blueprint JSON
                          ▼
             Postgres (pq_slides) + audit log
```

Every arrow crossing B1/B2/B3 is a threat surface. Section 4 walks
STRIDE per component.

---

## 4. STRIDE by component

Rating scale for **Residual risk** after existing controls:
- **Low**: control is robust; a breach requires a novel technique.
- **Med**: control exists but is incomplete or depends on config that
  can drift.
- **High**: no control today; would be exploited by a mid-skill
  attacker.

### 4.1 Landing + marketing pages `/presentiq`

| STRIDE | Threat | Existing control | Residual | Gap |
|--------|--------|------------------|----------|-----|
| S | Attacker spoofs the site (phishing) via typosquat, forged emails | HSTS preload, CAA record on prod domain (external), DMARC (external) | Low | — |
| T | Content injection into SEO-indexed pages (poisoning) | Static content, no user-writeable copy on marketing pages | Low | — |
| R | User denies signing up | Supabase auth logs signup events; no impact on marketing pages | N/A | — |
| I | Leak of tracking / analytics data to third parties | No third-party tracker shipped. Only Vercel analytics if enabled at project level | Low | Verify no GTM slipped into a future PR |
| D | Volumetric DDoS on marketing pages | Vercel Edge scrubbing + auto-scale | Low | — |
| E | Marketing page privilege escalates into app | Marketing routes are static; auth pages sit under different segments | Low | — |

### 4.2 Auth (Supabase-backed)

| STRIDE | Threat | Existing control | Residual | Gap |
|--------|--------|------------------|----------|-----|
| S | Session token theft via XSS | JSON-LD scripts are the only inline scripts and carry pure `JSON.stringify` output. No user input reaches `dangerouslySetInnerHTML`. HttpOnly Supabase cookies | Med | Ship a Content-Security-Policy that blocks inline execution outside allowlisted hashes |
| T | JWT tampering | Supabase verifies signature; RS256 keys managed by Supabase | Low | — |
| R | Denial of a login by a user | Supabase auth logs `signInWithPassword` and OAuth callbacks | Low | — |
| I | Password stored in plaintext | Supabase manages Argon2 hashing | Low | — |
| D | Credential stuffing / brute force | Supabase rate-limits by IP + user | Med | Add Cloudflare Turnstile / hCaptcha on `/login` and `/signup` |
| E | Anon user reads authenticated data | Supabase RLS policies on every `pq_*` table gate by `organization_id` from JWT | Low | Requires the RLS test suite in `supabase/tests/` |

### 4.3 API routes `/api/**`

| STRIDE | Threat | Existing control | Residual | Gap |
|--------|--------|------------------|----------|-----|
| S | Unauthenticated caller reaches privileged endpoint | Each admin route calls `getUser()` then checks `role='admin'` | Low | — |
| T | Parameter tampering to update another org's data | RLS by `organization_id` derived from JWT prevents cross-tenant writes even if the route forgot to filter | Low | — |
| R | User denies making a chargeable API call | Every write goes through `writeAudit()` into `pq_audit_log` | Low | Add `X-Request-Id` echoing so support can trace |
| I | Stack trace leaked in 500 response | Route handlers return structured `{error}` on the paths reviewed | Low | Confirm no route returns `err.stack` anywhere |
| D | LLM call timeout ties up serverless slot | Route handlers set `runtime = 'nodejs'` and rely on Vercel's 60s ceiling | Med | Cap per-request tokens client-side; add server-side hard timeout on LLM calls |
| E | Fallback from SERVICE_ROLE_KEY to ANON_KEY in admin routes | `SUPABASE_SERVICE_ROLE_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY` — if the service key is missing in prod, admin routes silently use the anon key and any admin action gets subjected to RLS as an anon caller. Depending on RLS policy this could leak or reject inconsistently. | **High** (config drift) | **PATCH**: fail closed with 503 when `SUPABASE_SERVICE_ROLE_KEY` is unset. See `src/app/api/admin/*/route.ts`. |

### 4.4 Stripe webhook `/api/presentiq/billing/webhook`

| STRIDE | Threat | Existing control | Residual | Gap |
|--------|--------|------------------|----------|-----|
| S | Forged webhook posts fake `checkout.session.completed` | `stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET)` verifies signature; missing sig → 400 | Low | — |
| T | Attacker replays an old event to double-activate | Stripe events are idempotent by ID; DB upserts by `organization_id` are idempotent by primary key | Low | — |
| R | Missed webhook delivery | Stripe retries 3+ days. On success we write an audit entry. | Low | — |
| I | Sensitive Stripe object leaked in log | Route logs event.type only, not full body | Low | — |
| D | Bad actor floods webhook endpoint | Signature check rejects unsigned within microseconds; Vercel Edge absorbs volume | Low | — |
| E | Webhook body triggers privilege escalation | Only `organization_id` from metadata is trusted; no role changes flow through | Low | — |

### 4.5 Client (browser) surface

| STRIDE | Threat | Existing control | Residual | Gap |
|--------|--------|------------------|----------|-----|
| S | Compromised third-party script exfiltrates cookies | No third-party scripts today. Fonts served via `preconnect` to `fonts.googleapis.com` | Med | Ship CSP with `script-src 'self' 'strict-dynamic'` and no unsafe-inline |
| T | Modified service worker (`/sw.js`) caches a poisoned response | Origin-locked SW: `self.location.origin` gate blocks cross-origin puts | Low | — |
| R | User claims they never uploaded a file | Uploads go through Supabase Storage which records timestamp, size, MIME | Low | — |
| I | XSS via user-supplied brand-kit content | Brand kit fields are typed (color hex, font family) and rendered via React (auto-escaped). Uploaded logo previews are blob URLs; not persisted before validation | Low | Confirm no HTML rich text field lands unescaped on a rendered page |
| D | Runaway animation loop drains battery | Framer motion-free; all animations are CSS keyframes that respect `prefers-reduced-motion` | Low | — |
| E | PWA install path prompts on an origin the user does not trust | `beforeinstallprompt` only fires on same-origin visits after service worker registration | Low | — |

### 4.6 Environment / build

| STRIDE | Threat | Existing control | Residual | Gap |
|--------|--------|------------------|----------|-----|
| S | Compromised dependency pushes malicious code | `npm ci` uses lockfile; `npm audit --omit=dev` reviewed on Round 4 (14 residual advisories) | Med | Enable Dependabot security updates; add CI step running `npm audit --production --audit-level=high` |
| T | Secret leaked into git history | `.env*` are `.gitignore`d; only `.env*.example` tracked | Low | Add a pre-commit `gitleaks` scan |
| R | Deployment history tampered | Vercel logs immutable deployments per commit | Low | — |
| I | Env vars printed in build log | Next.js does not print env values; `poweredByHeader: false` in `next.config.mjs` | Low | — |
| D | Bad build ships to prod | GitHub PR checks + Vercel preview deployments block on typecheck / test / build failure | Low | — |
| E | `NEXT_PUBLIC_*` env var elevates in the browser | Only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `NEXT_PUBLIC_APP_URL` + `NEXT_PUBLIC_DEMO_MODE` used | Low | Grep-based CI check that no `NEXT_PUBLIC_*_SECRET` or `_KEY` exists in prod builds |

---

## 5. Gaps closed in this commit

- **G1** Added `Content-Security-Policy`, `Cross-Origin-Opener-Policy`,
  `Cross-Origin-Resource-Policy`, and `Origin-Agent-Cluster` headers
  in `next.config.mjs`.
- **G2** Admin route service-role fallback removed. Missing
  `SUPABASE_SERVICE_ROLE_KEY` in prod now returns 503 with a clear
  error, not silent anon-key use.

## 6. Gaps still open (tracked)

- Add `gitleaks` pre-commit + CI scan.
- Add hCaptcha / Cloudflare Turnstile on `/login` and `/signup` to
  raise the bar on credential stuffing.
- Wire a server-side hard timeout (25s) on LLM fetch calls so a stuck
  provider does not exhaust the Vercel serverless slot.
- Enable Dependabot security updates on the repo.
- Ship an RLS test suite under `supabase/tests/` that runs on every
  migration.

## 7. How to review

When a PR touches any file below, re-run this document's threat
questions:

- `middleware.ts`
- `next.config.mjs`
- Anything under `src/app/api/**`
- Anything under `supabase/migrations/**`
- Anything that reads or writes cookies
- Anything that renders untrusted HTML

If you add a **new** trust boundary (a new external service, a new
storage backend, a new auth provider), extend Section 2 and add a
STRIDE row in Section 4 in the same PR.
