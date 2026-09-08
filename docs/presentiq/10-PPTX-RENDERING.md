# PresentIQ — PPTX Rendering Strategy

The most decisive technical bet: the deck must be **editable PowerPoint**, not a flat image deck.

## 1. Engine Choice

- **Library:** [`pptxgenjs`](https://github.com/gitbrent/PptxGenJS) on the Node side.
- Reasons: pure JS (no native deps), supports text frames, shapes, tables, charts, masters, theme colors, RTL paragraph properties via raw XML hooks, speaker notes, image fills.
- Fallback path for advanced layouts: write raw OOXML fragments via `pptxgenjs` extensions.

## 2. Modules

```
src/lib/presentiq/pptx/
  index.ts                public API
  theme.ts                build pptxgenjs theme from BrandRulesContext
  master.ts               master slide builders (cover, content, divider, decision, closing)
  layouts/
    kpi-card.ts
    timeline.ts
    process-flow.ts
    decision-matrix.ts
    risk-heatmap.ts
    before-after.ts
    dashboard.ts
    architecture.ts
    cause-effect.ts
    waterfall.ts
    pyramid.ts
    route-line.ts
    stakeholder-map.ts
    bilingual.ts
  rtl.ts                  RTL paragraph helpers
  charts.ts               chart builders
  tables.ts               table builders
  text.ts                 multi-run text helpers (mixed AR/EN)
  speaker-notes.ts        speaker note injector
  template-intelligence.ts parse uploaded template → tokens + layouts
  export.ts               render a DeckVersion to .pptx + .pdf
```

## 3. Theme Build

`buildPptxTheme(ctx: BrandRulesContext)` returns a `pptxgenjs` master + theme:

- `pptx.theme = { ... }` is replaced with a custom XML that pins:
  - `clrScheme` to brand palette.
  - `fontScheme` to brand fonts (EN + AR fallback chain).
  - `fmtScheme` (default formats).
- Cover, content, divider, decision and closing masters are added with `pptx.defineSlideMaster({ ... })`.
- Logo image placeholder is added at `top_right` per `BrandRulesContext.layout.logo_placement`.

## 4. Slide Construction

Slides are built from a typed `Slide.content_json`:

```ts
type SlideModel =
  | { kind: "cover";  title:string; subtitle?:string; date?:string }
  | { kind: "exec_summary"; bullets: string[] }
  | { kind: "decision"; recommendation: string; rationale: string[] }
  | { kind: "kpi";    cards: { label:string; value:string; delta?:string }[] }
  | { kind: "timeline"; milestones: { date:string; label:string; status?: "done"|"now"|"next" }[] }
  | { kind: "process"; steps: { label:string; description?:string }[] }
  | { kind: "matrix"; rows: string[]; cols: string[]; cells: string[][] }
  | { kind: "risk_heatmap"; risks: { name:string; likelihood:1|2|3; impact:1|2|3 }[] }
  | { kind: "before_after"; before: string[]; after: string[] }
  | { kind: "chart";  spec: ChartSpec }
  | { kind: "table";  headers:string[]; rows:string[][] }
  | { kind: "stakeholder_map"; quadrants: { high_high:string[]; high_low:string[]; low_high:string[]; low_low:string[] } }
  | { kind: "next_steps"; actions: { owner:string; due:string; action:string }[] }
  | { kind: "bilingual"; en: SlideModel; ar: SlideModel };
```

A `LayoutBuilder` is registered for each `kind`. The renderer iterates slides and dispatches to the matching builder.

## 5. RTL Rendering

`rtl.ts` exports `addRtlText(slide, text, opts)` which uses `pptxgenjs`'s `addText` with `paraSpaceBefore`, `align: "right"`, and a raw XML hook to inject `<a:pPr rtl="1">`. Mixed runs use the `text` array form:

```ts
slide.addText([
  { text: "نسبة الإنجاز ",  options: { lang: "ar-AE", align: "right", rtl: true, fontFace: "Tajawal" } },
  { text: "92%",            options: { lang: "en-US" } }
], { x: 0.5, y: 0.5, w: 9, h: 0.6 });
```

## 6. Charts

Chart library covers: Column, Stacked Column, Line, Area, Bar, Pie, Doughnut. Custom chart palette pulled from `ctx.charts.palette`. Grid style obeys `ctx.charts.grid`.

## 7. Tables

`tables.ts` produces zebra-striped or minimal tables. Cell padding obeys density. Arabic table cells set right alignment automatically.

## 8. Speaker Notes

`speaker-notes.ts` injects bilingual notes — English first, then a separator `--- العربية ---`, then Arabic — into `slide.addNotes(...)`.

## 9. Export

`export.ts`:

1. `renderDeck(project, deckVersion)` builds the `pptxgenjs` instance.
2. `pptx.write({ outputType: "nodebuffer" })` returns a `Buffer`.
3. The buffer is uploaded to storage at `org/{org_id}/projects/{project_id}/deck-{version}.pptx` and a signed URL is returned.
4. PDF: spawn LibreOffice headless `soffice --headless --convert-to pdf` if the binary is available; otherwise the API returns `pdf_unavailable` and the UI surfaces a friendly message + email-on-ready option (post-MVP).

## 10. Template Intelligence

`template-intelligence.ts`:

1. Parse uploaded `.pptx` as a ZIP.
2. Read `ppt/theme/theme1.xml` → extract palette + font scheme.
3. Read `ppt/slideMasters/*.xml` → extract master layouts, logo placeholders, margins.
4. Read `ppt/slideLayouts/*.xml` → extract layout list and placeholder definitions.
5. Convert into `BrandKit.design_tokens` + `BrandKit.layout_library`.
6. Persist back to `pq_brand_kits`.

This makes each customer's uploaded corporate template **first-class** in PresentIQ.

## 11. Quality Bar

- Open every generated PPTX in PowerPoint without errors.
- All text is editable.
- All shapes are editable.
- All charts are editable as native PowerPoint charts.
- Logo is undistorted.
- Arabic shapes do not show disconnected letters.
- Speaker notes preserve formatting.
