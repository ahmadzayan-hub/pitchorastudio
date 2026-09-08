# PresentIQ — Testing Plan

## 1. Test Pyramid

| Layer | Tooling | Target |
|---|---|---|
| Unit | Vitest | 80 % of `src/lib/presentiq/**` |
| Component | Vitest + Testing Library | wizard, editor, panels |
| API | Vitest + supertest-style harness | every route |
| Integration | Vitest with real Supabase (test schema) | full pipelines |
| E2E | Playwright (post-MVP) | wizard happy path + UAE Pine mode |
| Visual regression | pixelmatch on PNG renders of fixture decks | brand compliance |

## 2. Acceptance Tests (mirror §17 of brief)

`src/lib/presentiq/__tests__/acceptance.spec.ts` runs the 20 acceptance criteria against a seeded org.

## 3. Brand Compliance Test Set

Every preset (Corporate, Government, UAE Pine) has fixture inputs and a golden brand-compliance score expected ≥ 90.

## 4. Arabic RTL Test Set

- Validator tests cover every penalty rule.
- Renderer integration: parse the produced PPTX and assert RTL XML attributes.
- Visual diff: bilingual fixture deck rendered to PNG and compared against golden image.

## 5. Hallucination Test Set

A fixture brief with deliberately missing data must produce slides marked `[Input Required]` and `hallucination_risk_score < 20`.

## 6. Prompt Injection Test Set

A fixture upload contains common injection strings. The Security Guardrail must block ingestion and emit `security.injection_detected`.

## 7. PPTX Quality Test Set

For each layout builder, a fixture model is rendered and the produced `.pptx` is opened with a server-side parser to assert:
- Text frames are present.
- Shapes / charts / tables are not rasterised.
- Logo image is exactly one occurrence at expected position.
- No `<p:pic>` overlays the entire slide (rules out screenshot-only output).

## 8. Performance Tests

- Blueprint generation P50 < 25 s on the standard fixture.
- Full deck generation P50 < 90 s.
- Per-slide regeneration P95 < 12 s.

## 9. Security Tests

- AuthN: invalid token → 401.
- AuthZ: cross-org read returns 0 rows (RLS).
- Cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`.
- Webhook: invalid signature → 400.

## 10. CI

GitHub Actions: install → typecheck → test → build. PR blocked on failure.
