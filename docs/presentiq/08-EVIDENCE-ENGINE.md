# PresentIQ — Evidence-Controlled Generation Design

Evidence integrity is the difference between a useful AI deck and a dangerous one. PresentIQ never invents figures, approvals, contract clauses, KPIs or stakeholder positions.

## 1. Pipeline

```
Upload ──► Sanitize ──► Extract ──► Classify ──► Embed ──► Index ──► Cite
```

## 2. Stages

### 2.1 Sanitize
- Strip macros, embedded scripts, and OLE objects from PPTX/DOCX/XLSX.
- Run **Security Guardrail Agent** on extracted text to detect prompt injection — see `11-SECURITY.md`.
- Files that fail are quarantined: `injection_check_status = blocked`.

### 2.2 Extract
- PDF: `pdf-parse` for text + bbox + page references.
- DOCX: `mammoth` → HTML → text + table extraction.
- PPTX: native `JSZip` parse of slide XML, includes speaker notes.
- XLSX/CSV: `xlsx` library → tables → typed JSON.
- Images / screenshots: OCR pluggable behind `OcrProvider` interface.

Extracted output is normalised to `ExtractedDoc`:

```ts
type ExtractedDoc = {
  fileId: string;
  pages: { number: number; text: string }[];
  tables: { page: number; rows: string[][] }[];
  numbers: { value: number; unit?: string; page: number; span: [number,number] }[];
  dates:   { iso: string; page: number; span: [number,number] }[];
};
```

### 2.3 Classify
Every claim that becomes part of a slide is labelled by the **Evidence Agent** as one of:

| Class | Meaning |
|---|---|
| `fact` | Sourced from upload with high confidence |
| `user_input` | Provided by user in wizard |
| `ai_interpretation` | AI-derived narrative — flagged for reviewer |
| `professional_assessment` | Human-judgement statement (e.g. "low risk") |
| `estimate` | Numerical estimate based on partial evidence |
| `input_required` | **Mandatory placeholder.** Renders as `[Input Required]` |

Each classification carries a `confidence ∈ [0,1]`.

### 2.4 Embed & Index
- All evidence items are embedded with the active model provider's embedding endpoint.
- Stored in `pq_evidence_embeddings` (pgvector, IVFFlat, cosine).
- `org_id` filter is mandatory at query time.

### 2.5 Cite
- Each `Slide.evidence_refs[]` is the set of `EvidenceItem.id` used by the slide.
- Hover state in editor shows the source (file, page, span).
- Export → "Source Reference Sheet" lists every claim, classification, confidence, and source citation.

## 3. Hallucination Defences

1. **No-Invention Rule:** the Strategy and Copywriter prompts are constrained: "Do not introduce facts not present in the Evidence list. Use `[Input Required]` for missing data."
2. **Numerical Lock:** numbers in slides must match a number in `EvidenceItem.value` within ±0 tolerance (estimates require explicit `estimate` classification and an `~` prefix).
3. **Stakeholder Lock:** named approvals/decisions require `fact` or `user_input` classification.
4. **Contract Lock:** contract clauses require a `fact` reference with `source_reference.span`.
5. **QA Audit:** the QA agent re-checks every slide claim against the evidence store and emits a `hallucination_risk_score` in the QualityReport. Slides with score > 30 are highlighted in the Quality panel.

## 4. Missing Data UX

- Evidence Agent emits a `missing_data` list on the blueprint.
- Wizard surfaces these as a checklist before deck generation.
- Generated slides containing `[Input Required]` use a soft-orange callout in the editor.
- Export blocks if any `[Input Required]` remains in **boardroom** modes (configurable).

## 5. Confidentiality

- The agent provider plugin honours `confidentiality_level`:
  - `strictly_confidential` → only providers marked `enterprise_safe`.
  - Tenant admins set the allowed providers per organization in `pq_organizations.settings.allowed_providers`.

## 6. Storage of Evidence

- Source files live in `org/{org_id}/projects/{project_id}/sources/...`.
- Evidence rows live in Postgres with RLS.
- Evidence embeddings live in pgvector with RLS + `org_id` filter.
- Retention defaults to 365 days; configurable per org.
