# PresentIQ — System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Web Client                                  │
│   Next.js 14 (App Router) · React 18 · Tailwind · shadcn-style · RHF +   │
│   Zod · Framer Motion · Zustand                                          │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │ HTTPS (JWT cookie)
┌────────────────────────────▼─────────────────────────────────────────────┐
│                       Edge / Server (Next.js API)                        │
│  Route handlers · middleware (auth + tenant) · rate limit · audit log    │
└──┬──────────────┬───────────────┬──────────────┬────────────────────┬────┘
   │              │               │              │                    │
   │              │               │              │                    │
┌──▼───────┐  ┌───▼────────┐  ┌───▼─────────┐ ┌──▼────────────┐ ┌─────▼───┐
│ Supabase │  │  S3-style  │  │  AI Agent   │ │ PPTX Renderer │ │  Stripe │
│ Postgres │  │  Storage   │  │ Orchestrator│ │   (server)    │ │ Billing │
│ + RLS +  │  │ (per-tenant│  │  (Node)     │ │  pptxgenjs +  │ │ + webh. │
│ pgvector │  │  prefixes) │  │             │ │  PDF convert  │ │         │
└──────────┘  └────────────┘  └─────┬───────┘ └───────────────┘ └─────────┘
                                    │
                          ┌─────────▼─────────────────┐
                          │  Model Provider Plugins   │
                          │  Anthropic · OpenAI ·     │
                          │  Azure OpenAI · Local     │
                          └───────────────────────────┘
```

## 1. Layers

### 1.1 Web Client
- Next.js 14 App Router, server components by default, client components only when interactive state is needed.
- Tailwind + shadcn-style primitives in `src/components/presentiq/ui/`.
- Forms: React Hook Form + Zod (shared schemas with the API in `src/lib/presentiq/types`).
- State: Zustand for wizard state, React Server Components for everything else.

### 1.2 API Layer (Next.js Route Handlers)
- Single Next.js process exposes all REST routes under `/api/presentiq/*`.
- Middleware in `src/middleware.ts` injects: tenant resolution, authn (Supabase JWT), authz (role check), structured logging, audit-log emission.
- Rate limit via Redis token bucket (or in-memory fallback for local dev).

### 1.3 Persistence
- **Postgres** (Supabase) for relational data with **Row-Level Security** on every tenant-scoped table.
- **pgvector** for embedding-based retrieval over uploaded source files (RAG).
- **Object storage** (Supabase Storage / S3-compatible) for raw uploads, rendered PPTX, PDF, logos and templates.

### 1.4 AI Agent Orchestrator
- Pure Node-side orchestrator located in `src/lib/presentiq/ai/orchestrator.ts`.
- Pluggable model provider: `src/lib/presentiq/ai/provider.ts` (Anthropic by default).
- Prompt registry in `src/lib/presentiq/prompts/*.ts` — every prompt is versioned and unit-tested.
- Tool layer for retrieval, brand-rule lookup, terminology lookup, evidence lookup, RTL validator.

### 1.5 PPTX Renderer
- Server-side `pptxgenjs` engine in `src/lib/presentiq/pptx/`.
- Renders **real editable** objects: text boxes, tables, charts (column / line / bar / pie), shapes, icons, images, master slides, speaker notes, theme colors, RTL text frames.
- PDF export via headless conversion (LibreOffice if available, fallback to print-to-PDF service).

### 1.6 Billing
- Stripe Checkout + Customer Portal + Webhooks.
- Plans (`presentiq_plans`) seeded from `src/lib/presentiq/stripe/plans.ts`.

## 2. Multi-Tenancy

- Every domain row has `organization_id`.
- Postgres RLS policies enforce `organization_id = auth.org_id()`.
- Storage paths are `org/{org_id}/...` and are signed via short-lived URLs.
- Audit log is immutable (append-only) and replicates org-id.

## 3. Tenant Isolation Cheat-Sheet

| Resource | Mechanism |
|---|---|
| Postgres rows | RLS using `current_setting('request.jwt.claims', true)` |
| Storage | Bucket prefix + signed URLs |
| Embeddings | `org_id` column on `pgvector` table |
| Logs | structured logging includes `org_id`, `user_id`, `request_id` |
| AI calls | per-tenant prompt cache key includes `org_id` hash |

## 4. Module Map

| Module | Path | Responsibility |
|---|---|---|
| Org Workspace | `src/app/presentiq/dashboard` | tenant-level views |
| Brand Kit Manager | `src/lib/presentiq/brand` + `src/app/presentiq/brand-kits` | assets, tokens, rules |
| Template Intelligence | `src/lib/presentiq/pptx/template-intelligence.ts` | parse uploaded PPTX → tokens |
| Content Ingestion | `src/lib/presentiq/evidence/ingest.ts` | extract text + tables + numbers |
| AI Agents | `src/lib/presentiq/agents/*` | 17 specialised agents |
| Generator | `src/lib/presentiq/ai/orchestrator.ts` | sequence agents |
| Quality Engine | `src/lib/presentiq/quality/*` | 10 score dimensions |
| Review Workflow | `src/app/presentiq/projects/[id]/review` | approve / lock / regenerate |
| Export | `src/lib/presentiq/pptx/export.ts` | PPTX + PDF |

## 5. Deployment Topology (MVP)

- **Single region** Vercel (web + API) + Supabase (DB + storage).
- For Government Private Deployment: single-tenant Helm chart on UAE-hosted Kubernetes (post-MVP).

## 6. Environment Boundaries

```
.env.local          dev
.env.preview        Vercel previews
.env.production     production
.env.production.gcc UAE-region production (post-MVP)
```

Secrets never leave the server. Client only sees `NEXT_PUBLIC_*`.
