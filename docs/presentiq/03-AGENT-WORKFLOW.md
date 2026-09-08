# PresentIQ — Agent Workflow Design

PresentIQ is an **agentic workflow**. Generation is sequenced through 17 specialised agents. Each agent has: a single responsibility, a typed input, a typed output, a versioned prompt, and a measurable quality contribution.

```
                ┌────────────┐
  Wizard ──────►│   Intake   │──► structured Brief
                └─────┬──────┘
                      ▼
                ┌─────────────┐  source spans + classifications
                │  Evidence   │──► EvidenceItem[]
                └─────┬───────┘
                      ▼
                ┌────────────────────┐
                │ Brand Governance   │──► BrandRulesContext (locked)
                └─────┬──────────────┘
                      ▼
                ┌────────────┐    ┌──────────────┐
                │  Strategy  │──► │ Storytelling │ ──► Narrative
                └────────────┘    └─────┬────────┘
                                        ▼
                                ┌────────────────┐
                                │ Slide Architect│──► SlideBlueprint[]
                                └─────┬──────────┘
                                      ▼
                  ┌─────────────────┬──┴────┬───────────────────┐
                  ▼                 ▼       ▼                   ▼
         ┌─────────────────┐  ┌─────────┐  ┌──────────────┐  ┌────────────┐
         │ Executive       │  │ Visual  │  │ Data Viz     │  │ Arabic RTL │
         │ Copywriter      │  │ Designer│  │ (charts)     │  │ (if RTL)   │
         └────────┬────────┘  └────┬────┘  └──────┬───────┘  └─────┬──────┘
                  └────────────────┴──────┬───────┴────────────────┘
                                          ▼
                                  ┌────────────────┐
                                  │ Translation    │ (if bilingual)
                                  └─────┬──────────┘
                                        ▼
                                  ┌────────────────┐
                                  │ PPTX Renderer  │──► editable .pptx
                                  └─────┬──────────┘
                                        ▼
                                  ┌────────────────┐
                                  │ Animation Plan │
                                  └─────┬──────────┘
                                        ▼
                                  ┌────────────────┐
                                  │      QA        │──► QualityReport
                                  └─────┬──────────┘
                                        ▼
                                  ┌────────────────┐
                                  │ Security Guard │──► block / pass
                                  └─────┬──────────┘
                                        ▼
                                  ┌────────────────┐
                                  │   Revision     │ (slide-level)
                                  └─────┬──────────┘
                                        ▼
                                  ┌────────────────┐
                                  │   Export       │──► .pptx + .pdf
                                  └────────────────┘
```

## 1. Agent Contracts

Every agent implements:

```ts
interface Agent<I, O> {
  name: AgentName;
  version: string;          // semver — pinned per project
  run(input: I, ctx: AgentContext): Promise<O>;
}
```

`AgentContext` carries: `orgId`, `projectId`, `traceId`, `provider`, `tools`, `brandRules`, `evidenceStore`.

## 2. Agent Catalogue

| # | Agent | Input | Output | Notes |
|---|-------|-------|--------|------|
| 1 | Intake | wizard form + raw text | `Brief` (Zod) | asks only for missing critical fields |
| 2 | Evidence | uploaded files + text | `EvidenceItem[]` | classifies every claim |
| 3 | Brand Governance | brand kit + mode | `BrandRulesContext` | **locked** — downstream agents cannot override |
| 4 | Strategy | Brief + Evidence + Rules | `StrategicFrame` | context, problem, options, recommendation |
| 5 | Storytelling | StrategicFrame | `Narrative` | Hook→Problem→Insight→Solution→Impact→Decision |
| 6 | Slide Architect | Narrative | `SlideBlueprint[]` | per-slide structure |
| 7 | Executive Copywriter | SlideBlueprint | `SlideContent` | strong titles, no fluff |
| 8 | Arabic RTL | SlideContent | `SlideContent` (RTL-aware) | only if mode includes Arabic |
| 9 | Translation | EN ↔ AR | bilingual pair | not literal |
| 10 | Visual Designer | SlideBlueprint + Brand | `VisualPlan` | layout choice, icons, palette |
| 11 | Data Viz | tables/numbers | `ChartSpec` | chooses visual type |
| 12 | PPTX Renderer | full Slide[] | `.pptx` | editable objects |
| 13 | Animation Planner | Slide[] | `AnimationPlan` | subtle, executive-grade |
| 14 | QA | Slide[] + Brand + Evidence | `QualityReport` | 10 dimensions |
| 15 | Security Guardrail | uploaded text + agent outputs | `GuardDecision` | blocks injection, leakage |
| 16 | Revision | one slide + instruction | `Slide` | per-slide regeneration |
| 17 | Export | DeckVersion | `.pptx` + `.pdf` | also produces speaker-notes doc + source ref sheet |

## 3. Determinism & Caching

- Inputs to each agent are **canonicalised** (sorted JSON) and hashed (SHA-256).
- Output is cached in `ai_cache(org_id, agent, input_hash)` — TTL = 24 h for non-final agents, 7 d for final.
- Slide-level cache key includes `slide_id + content_hash` so that locked slides do not regenerate.

## 4. Sequencing Rules

1. **Brand Governance runs before any visual or text.** Its output is read-only for downstream agents.
2. **Evidence runs before Strategy.** Strategy may not introduce facts not present in Evidence.
3. **Security Guardrail wraps every external boundary**: uploaded text, agent outputs, exports.
4. **Per-slide regeneration** skips Intake / Evidence / Strategy / Storytelling / Architect — it re-runs Copywriter / Visual / RTL / Translation / Renderer for **one** slide only.

## 5. Failure Modes

| Failure | Behaviour |
|---|---|
| Provider timeout | retry × 2 with exponential backoff, then surface `[Generation Failed]` slide |
| Evidence missing for required claim | mark slide as `[Input Required]`, never invent |
| Brand violation detected by QA | revise once; if still violating, lower deck score and surface in panel |
| Prompt injection detected | hard-stop, log audit event `security.injection_detected` |
| RTL validation failure | revise once, then mark `rtl_score < 0.6` and surface |

## 6. Observability

- Every agent run emits a structured trace event: `{trace_id, project_id, agent, version, latency_ms, tokens_in, tokens_out, cache_hit}`.
- Traces are visible in the admin Observability dashboard (post-MVP) and stored in the `audit_logs` table during MVP.
