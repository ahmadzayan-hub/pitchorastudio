# PresentIQ — Product Requirements Document

**Version:** 1.0 · MVP
**Status:** Build-ready
**Owners:** PresentIQ Product Engineering

## 1. Product Promise

> **From raw content to boardroom-ready presentation in minutes, with corporate standards enforced automatically.**

PresentIQ is an **AI Agent Platform** for corporate presentation generation. It is **not** an LLM prompt wrapper. It is a multi-agent workflow that combines brand governance, evidence-controlled generation, editable PPTX rendering, Arabic-English bilingual capability, boardroom storytelling, quality scoring, secure file handling, human review, fast slide regeneration and PPTX/PDF export.

## 2. Target Users

| Segment | Primary Job-To-Be-Done |
|---|---|
| Corporate teams | Quarterly business reviews, board updates |
| Government entities | Decision papers, executive briefings |
| Consulting firms | Client deliverables, partner-grade decks |
| Engineering / PMO | Steering committee updates, RCA, EOT cases |
| Banks & financial institutions | Investment cases, risk briefings |
| Strategy departments | Strategic options & roadmaps |
| Sales & BD | Pitch decks, tender submissions |
| Training | Learning decks with bilingual narration |
| Executive offices | Decision-required boardroom packs |

## 3. Problem Statements

1. Slide creation consumes 20–60 % of a knowledge worker's time.
2. AI tools generate attractive decks but break corporate standards: logos, fonts, colors, terminology, slide density, RTL.
3. Decks are text-heavy and rarely decision-oriented.
4. AI hallucinates numbers and approvals — unsafe for boardrooms.
5. Arabic RTL is broken in most generators — fatal for UAE/GCC.
6. Corporate users need **editable PPTX**, not flattened images.
7. Organizations need auditability, confidentiality, approval workflows.

## 4. Differentiators

1. **Brand governance before creativity** — color, font, logo, tone, terminology, density rules enforced by an agent before any visual is rendered.
2. **Editable PPTX output** — real text boxes, shapes, charts, tables, master slides, speaker notes — not screenshots.
3. **Arabic RTL engine** — bilingual layouts, mirrored diagrams, correct shaping, formal corporate Arabic, government tone.
4. **Evidence-controlled generation** — every claim is classified (`fact | input | interpretation | assessment | estimate | required`) and linked to source spans.
5. **Boardroom Readiness Score** — answers "Is this deck ready for the CEO?".
6. **Agentic workflow** — 17 specialized agents, not a single LLM call.
7. **Template Intelligence** — uploaded PPTX templates become reusable design tokens + layout libraries.

## 5. Presentation Modes (MVP)

`corporate_boardroom`, `government_boardroom`, `rta_boardroom`, `consulting_partner`, `sales_pitch`, `project_steering`, `technical_to_executive`, `strategy_deck`, `kpi_dashboard`, `training`, `investor_business_case`, `tender_proposal`.

`rta_boardroom` is a **premium specialised mode** — not the only use case. Any organisation can be onboarded via custom brand kits + templates.

## 6. Top-Level User Journey (Wizard)

1. Select Mode → 2. Brief → 3. Upload Sources → 4. Brand Kit → 5. Blueprint (human review) → 6. Generate Deck → 7. Quality Review → 8. Edit / Regenerate → 9. Export PPTX/PDF.

## 7. Functional Scope (MVP — Acceptance Criteria)

The MVP is accepted only when **all 20** acceptance criteria from §17 of the brief pass:

- Org creation, brand kit upload, template upload, file upload.
- Blueprint generation, full editable PPTX generation.
- PPTX is **not** a screenshot deck.
- Arabic-only / English-only / bilingual decks.
- Arabic RTL exports correctly into PowerPoint.
- Logo placement is consistent.
- Brand compliance is scored.
- Missing data is flagged, not invented.
- Per-slide regeneration without re-running the full deck.
- PPTX + PDF export.
- Quality score panel.
- UAE Pine Boardroom Mode produces a decision-oriented deck.
- Admin audit logs.
- Prompt-injection in uploads cannot override platform rules.
- Stripe billing for web subscriptions is functional.
- UI feels premium, simple, enterprise-ready.

## 8. Non-Goals (MVP)

- Mobile native apps.
- Live multi-user editing.
- Template marketplace.
- Video generation.
- Apple IAP / Google Play Billing.
- Voiceover / TTS narration.

## 9. Success Metrics

| Metric | Target |
|---|---|
| Deck generation P50 time | < 90 s |
| Boardroom Readiness Score (median) | ≥ 78 |
| Brand Compliance Score (median) | ≥ 90 |
| Hallucination Risk Score (median) | ≤ 15 |
| Arabic RTL Score on bilingual decks | ≥ 95 |
| Per-slide regeneration P95 | < 12 s |
| Trial → Paid conversion | ≥ 8 % |

## 10. Pricing Tiers

| Plan | Trial | Pro | Business | Enterprise | Government Private |
|---|---|---|---|---|---|
| Decks/mo | 3 | 50 | 250 | Unlimited (fair use) | Custom |
| Brand kits | 1 | 3 | 25 | Unlimited | Tenant-isolated |
| AI credits | included | 50k | 250k | 2M | dedicated quota |
| Storage | 200 MB | 5 GB | 50 GB | 500 GB | dedicated |
| SSO | – | – | OIDC | SSO + SAML + MFA | + private model |

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| PPTX rendering quality | Real `pptxgenjs` + master slide templates, per-element renderers |
| Arabic RTL drift in PowerPoint | RTL agent + RTL validator + visual diff tests |
| Hallucination in boardroom decks | Evidence agent + classification + `[Input Required]` |
| Prompt injection from uploaded docs | Security guardrail agent (§ Security doc) |
| Brand drift between modes | Brand governance agent runs **before** Visual Designer |
| Multi-tenant data leakage | Postgres RLS on every table; per-org S3 prefixes |
