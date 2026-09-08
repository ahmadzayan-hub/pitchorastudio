# PresentIQ — Arabic RTL Engine Design

Arabic RTL support is mandatory and must export correctly into PowerPoint.

## 1. Engine Components

| Component | Path |
|---|---|
| RTL agent | `src/lib/presentiq/agents/rtl.ts` |
| Translator | `src/lib/presentiq/agents/translation.ts` |
| RTL validator | `src/lib/presentiq/rtl/validate.ts` |
| RTL renderer | `src/lib/presentiq/pptx/rtl.ts` |
| Bilingual layout | `src/lib/presentiq/pptx/bilingual.ts` |

## 2. Design Rules

1. **Right alignment** for Arabic text frames. PPTX `align="right"` + RTL paragraph property.
2. **RTL bidi paragraph property**: the renderer sets `<a:pPr rtl="1">` on every Arabic paragraph.
3. **Font fallback chain** for Arabic: `Tajawal → Noto Kufi Arabic → Alexandria → Dubai → Calibri`.
4. **Punctuation**: Arabic comma `،`, Arabic question mark `؟`, Arabic semicolon `؛`. Validator replaces ASCII counterparts when within an Arabic run.
5. **Numerals**: by default PresentIQ keeps Arabic-Indic numerals **off** (Western digits) for boardroom decks because executives consume KPIs in Western digits. Configurable per brand kit.
6. **Mixed runs**: Arabic + English in the same paragraph use **two `<a:r>` runs** with explicit `lang="ar-AE"` / `lang="en-US"` and explicit script direction.
7. **Bilingual layout**: English on the **left**, Arabic on the **right**. Equal vertical content weight. The RTL agent re-balances rather than translating literally.
8. **Mirrored diagrams**: when a diagram has a directional flow (timeline, process), the bilingual variant mirrors the flow direction for the Arabic side.
9. **Translation tone**: formal corporate Arabic, no Egyptian / Levantine colloquialisms in official modes (`government_*`, `rta_boardroom`, `corporate_boardroom`).

## 3. Translation Behaviour

- The Translation Agent receives **English content + bilingual terminology table + brand tone**.
- Output is **meaning-preserving**, not literal. The agent is explicitly told: "Do not perform word-for-word translation if it damages Arabic quality."
- Approved EN→AR pairs are enforced via a deterministic post-processor before being sent to the renderer.

## 4. Validator Rules

The RTL validator scores 0–100 by running these checks:

| Check | Penalty |
|---|---|
| Arabic paragraph missing `rtl` property | −10 |
| Arabic text in a non-Arabic font | −10 |
| ASCII punctuation inside Arabic run | −2 each |
| Disconnected letters (signal of broken shaping) | −20 |
| RTL/LTR direction mix without explicit run break | −5 each |
| Required terminology not used | −3 each |
| Forbidden colloquial phrase detected | −15 each |
| Bilingual slide with unequal content weight ( |Δwords| > 30 % ) | −10 |

A slide is **RTL-pass** if score ≥ 90.

## 5. PPTX Renderer Specifics

- For RTL slides we set:
  - `<p:bldGraphic rtl="1"/>` on lists.
  - `<a:pPr rtl="1" algn="r">` on paragraphs.
  - `<a:rPr lang="ar-AE">` on runs.
  - Text frame `bodyPr` with `wrap="square"` and `vert="horz"`.
- For tables in RTL: column order is reversed when the table is part of an Arabic frame.
- For charts: the chart `lang` is set to `ar-AE`; axes labels render correctly in Arabic.

## 6. Bilingual Layout Templates

Three built-in bilingual templates:

1. **Side-by-side** — English left, Arabic right, equal columns.
2. **Stacked** — English on top, Arabic below, single column. Used for KPI cards.
3. **Hero + caption** — Visual centred, English caption left, Arabic caption right.

The Visual Designer Agent picks the template based on slide content and density.

## 7. Tests

- Unit tests for the validator (coverage of every penalty rule).
- Integration test: generate a sample bilingual deck, open it in `pptxgenjs` parser, assert Arabic runs have `rtl=1`.
- Visual regression: a fixture deck rendered to PNG and diffed against a golden image.
