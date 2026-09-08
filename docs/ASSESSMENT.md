# Self-Assessment & Improvement Plan

An honest review of the v0.1 implementation through a *customer-value* lens.

## What works well

| Area | State | Why it's good |
|---|---|---|
| Multi-tenant data model | ✅ | Real RLS on `org_id`, auto-provisioned org per signup |
| Engine separation | ✅ | Orchestration / Clarification / Template / Formatter are isolated services |
| Free-stack runnable | ✅ | Boots on Vercel free + Supabase free + local Ollama with no paid keys |
| Browser extension | ✅ | MV3 manifest, service worker, content-script injection on 4 AI hosts |
| Build hygiene | ✅ | Typecheck + production build pass with empty env (lazy env access) |

## Where it falls short (customer perspective)

| Problem | Customer pain | Severity |
|---|---|---|
| Always asks 3–6 clarification questions | Sometimes the user just wants a quick polish | High |
| Empty workspace on first visit | Cold-start: new user has no idea what to type | High |
| LLM-down error is a raw 500 | Looks broken, not "config needed" | High |
| No before/after view | User can't see the value they're getting | Medium |
| No history search | Past sessions become unfindable past 20–30 entries | Medium |
| No Gemini support | Excludes a major model audience | Medium |
| No prompt diff between versions | Versioning exists in DB but not visible | Low |
| No tests | Refactors risk silent regressions | Eng quality |
| No usage caps | Free-tier abuse risk if traffic grows | Eng quality |
| No streaming responses | User stares at a spinner for 10–30 s | UX |
| No share link for a session | Can't show a colleague the rebuilt prompt | Medium |
| English-only system prompts | Limits non-English users | Low |

## Improvements shipped in this iteration

The five highest-leverage fixes:

1. **Quick mode** — `?quick=1` skips clarifications and finalizes in one call. Users who *know* what they want get an answer in one shot.
2. **Starter prompts** on the workspace — six clickable examples covering coding/writing/research/analysis. Solves the cold-start problem.
3. **Graceful LLM-down handling** — Ollama `ECONNREFUSED` returns a clear `503 llm_unreachable` with setup instructions instead of a generic 500.
4. **Before/after panel** on the finalized prompt — side-by-side, with char/word counts so users can *see* the value delivered.
5. **Gemini target model** — added throughout (enum, format hints, content script).

Plus engineering quality:

- **Vitest** harness with unit tests for `template.ts`, `formatter.ts`, `clarification.ts` rule heuristics, and `ollama.ts` JSON-recovery logic.
- **History search box** — filters by intent and prompt text client-side.

## Improvements deferred to v0.3

| Idea | Why deferred |
|---|---|
| Streaming finalize | Requires Server-Sent Events scaffolding; bigger refactor |
| Public share links | Needs unguessable token + read-only view route |
| Usage caps + per-IP rate limits | Needs a counters table and middleware |
| Prompt-version diff UI | Worth doing once a real customer asks for it |
| i18n for system prompts | Wait for first non-English user signal |
| Feedback loop ("this prompt worked / didn't") | Needs review before adding telemetry |

## Success metrics worth tracking once live

- Time-to-first-final-prompt (intake → finalize)
- % of sessions that use Quick mode vs. clarifications
- Avg. clarification questions answered before finalize
- Final-prompt copy rate (proxy for "user actually used it")
- Returning users / week
