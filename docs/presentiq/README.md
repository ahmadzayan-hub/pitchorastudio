# PresentIQ

> From raw content to boardroom-ready presentation in minutes,
> with corporate standards enforced automatically.

PresentIQ is an **AI Agent Platform** for corporate presentation generation. Not a prompt wrapper — an agentic workflow that combines **brand governance**, **evidence-controlled generation**, **editable PPTX rendering**, **Arabic-English bilingual capability**, **boardroom storytelling**, **quality scoring**, **secure enterprise file handling**, **human review**, **fast slide regeneration** and **PPTX/PDF export**.

## Documents

| # | Document | Path |
|---|----------|------|
| 1 | Product Requirements | [01-PRD.md](./01-PRD.md) |
| 2 | System Architecture | [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) |
| 3 | Agent Workflow | [03-AGENT-WORKFLOW.md](./03-AGENT-WORKFLOW.md) |
| 4 | Database Schema | [04-DATABASE.md](./04-DATABASE.md) |
| 5 | API Specification | [05-API.md](./05-API.md) |
| 6 | UI / Wireframe Structure | [06-UI.md](./06-UI.md) |
| 7 | Brand Governance Engine | [07-BRAND-GOVERNANCE.md](./07-BRAND-GOVERNANCE.md) |
| 8 | Evidence-Controlled Generation | [08-EVIDENCE-ENGINE.md](./08-EVIDENCE-ENGINE.md) |
| 9 | Arabic RTL Engine | [09-ARABIC-RTL.md](./09-ARABIC-RTL.md) |
| 10 | PPTX Rendering Strategy | [10-PPTX-RENDERING.md](./10-PPTX-RENDERING.md) |
| 11 | Security Architecture | [11-SECURITY.md](./11-SECURITY.md) |
| 12 | Billing Architecture | [12-BILLING.md](./12-BILLING.md) |
| 13 | MVP Implementation Plan | [13-MVP-PLAN.md](./13-MVP-PLAN.md) |
| 14 | Testing Plan | [14-TESTING.md](./14-TESTING.md) |

## Code Layout

```
src/
  lib/presentiq/
    types/             shared TS types + zod schemas
    brand/             governance + presets (UAE Pine, Government, Corporate, Consulting)
    evidence/          file extractors + classifier
    rtl/               Arabic RTL validator + normaliser
    security/          prompt-injection + fake-approval detectors
    quality/           10-dimension scorer
    ai/
      provider.ts      pluggable model providers (Anthropic, Mock)
      cache.ts         input-hash cache
      orchestrator.ts  17-agent workflow
    prompts/           versioned prompt registry
    pptx/
      theme.ts         masters + theme tokens
      layouts.ts       layout builders (cover, exec, decision, kpi, timeline,
                       process, matrix, risk, before/after, chart, table,
                       stakeholder, next steps, bullets, bilingual)
      text.ts          mixed AR/EN run helpers
      render.ts        deck render entry point
      template-intelligence.ts   parse uploaded PPTX → tokens + layouts
    storage/           supabase + audit log writer
    stripe/            plan registry + Stripe client
    auth/              request context resolver
  app/
    presentiq/         landing + dashboard + projects + brand kits + admin + billing
    api/presentiq/     all REST endpoints
  components/presentiq/ small UI primitives + QualityPanel

supabase/migrations/
  0010_presentiq_init.sql   full DDL + RLS + plan seed
```

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
#   set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#   SUPABASE_SERVICE_ROLE_KEY. Optionally set ANTHROPIC_API_KEY +
#   STRIPE_* keys.

# 3. Apply database migrations
psql "$SUPABASE_DB_URL" -f supabase/migrations/0010_presentiq_init.sql

# 4. Run dev server
npm run dev
# open http://localhost:3000/presentiq
```

If `ANTHROPIC_API_KEY` is not set, the orchestrator falls back to the mock
provider — the full pipeline still runs end-to-end (with placeholder content)
so you can develop, test, and ship.

## MVP Acceptance

The 20 acceptance criteria from the brief are tracked in [01-PRD.md §7](./01-PRD.md). The pipeline is end-to-end real:

- Real `pptxgenjs` rendering with master slides + theme tokens.
- Real Arabic RTL paragraph properties + mixed AR/EN runs.
- Real prompt-injection detection blocking uploaded text from overriding system prompts.
- Real Stripe Checkout + webhook + customer portal.
- Real Supabase RLS policies on every tenant table.
