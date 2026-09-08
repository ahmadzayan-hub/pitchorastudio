# PresentIQ — MVP Implementation Plan

The MVP is built in this exact order. Every milestone has clear exit criteria.

## M1 · Foundation (Week 1)
- Monorepo wiring under existing Next.js app: `src/lib/presentiq`, `src/app/presentiq`, `src/app/api/presentiq`.
- Supabase migration `0010_presentiq_init.sql`.
- Auth wired to Supabase + tenant resolution middleware.
- Stripe plans seeded.
- Exit: `/presentiq/dashboard` renders for an authenticated user with the correct org.

## M2 · Brand Kit Manager (Week 2)
- Brand kit CRUD API.
- Logo / template / font upload endpoints.
- Template Intelligence Engine: parse uploaded PPTX → tokens + layouts.
- Brand kit editor UI.
- Exit: Upload a PPTX, see tokens, save kit, default kit selection works.

## M3 · Project Wizard (Week 2-3)
- Wizard pages 1-4.
- Source file upload.
- Project create / read APIs.
- Exit: Project created in DB, files visible.

## M4 · Evidence Engine (Week 3)
- Extractors for PDF, DOCX, PPTX, XLSX, CSV.
- Sanitiser + Security Guardrail.
- Evidence Agent producing `EvidenceItem[]` with classifications.
- pgvector embedding pipeline.
- Exit: Upload a PDF, see extracted evidence with classifications.

## M5 · Agent Orchestration (Week 3-4)
- Provider abstraction (Anthropic + mock).
- Agents: Intake, Evidence (wired in M4), Brand Governance, Strategy, Storytelling, Slide Architect, Executive Copywriter, Visual Designer, Data Viz, RTL, Translation, Animation Planner, QA, Security Guardrail, Revision, Export.
- Orchestrator with caching.
- Exit: `/blueprint` and `/slides` endpoints work end-to-end on a sample brief.

## M6 · PPTX Renderer (Week 4-5)
- Theme builder.
- Master slides (cover, content, divider, decision, closing).
- Layout builders (kpi, timeline, process, matrix, risk, before-after, chart, table, bilingual, stakeholder map).
- RTL helpers.
- Speaker notes.
- Export PDF via LibreOffice.
- Exit: Editable PPTX opens in PowerPoint, Arabic renders correctly, logos placed.

## M7 · Quality Engine + Editor (Week 5)
- 10-dimension scorer.
- Quality panel UI.
- Slide editor with regenerate / simplify / translate / approve / lock.
- Per-slide regeneration API.
- Exit: User edits a slide and re-exports without regenerating the deck.

## M8 · Review & Approvals + Audit (Week 5-6)
- Comments, approve/lock, version history.
- Admin audit log view.
- Exit: A reviewer can comment, approve, lock; admin sees the trail.

## M9 · Billing (Week 6)
- Stripe Checkout, Customer Portal, Webhooks.
- Plan / usage gating in middleware.
- Exit: Upgrade flow round-trips and applies plan limits.

## M10 · Polish & Beta (Week 7)
- Empty states, loading states, error states.
- Premium look-and-feel pass.
- Smoke tests + integration tests for the 20 acceptance criteria.
- Exit: Internal beta with 3 design partners; all 20 acceptance criteria pass.

## Cross-Cutting Throughout
- Logging, tracing, metrics.
- Tests written alongside features.
- Security review before each milestone close.
