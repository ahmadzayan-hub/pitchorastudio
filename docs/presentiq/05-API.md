# PresentIQ — API Specification

All routes live under `/api/presentiq/*`. Authentication is a Supabase JWT cookie. Tenant resolution happens in `src/middleware.ts`. Every mutating request emits an `audit_logs` row.

## Conventions

- JSON in / JSON out.
- Errors use `{ error: { code, message, details? } }`.
- Pagination: `?cursor=&limit=` returning `{ items, next_cursor }`.
- Idempotency: mutating routes accept optional `Idempotency-Key` header.

## 1. Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/presentiq/auth/login` | Email + password (delegates to Supabase) |
| POST | `/api/presentiq/auth/logout` | Clear cookies |
| GET  | `/api/presentiq/auth/me` | Current user + org + role |

## 2. Organizations

| Method | Path |
|---|---|
| GET | `/api/presentiq/organizations/current` |
| PATCH | `/api/presentiq/organizations/current` |

## 3. Brand Kits

| Method | Path |
|---|---|
| POST | `/api/presentiq/brand-kits` |
| GET | `/api/presentiq/brand-kits` |
| GET | `/api/presentiq/brand-kits/:id` |
| PATCH | `/api/presentiq/brand-kits/:id` |
| DELETE | `/api/presentiq/brand-kits/:id` |
| POST | `/api/presentiq/brand-kits/:id/upload-logo` (multipart) |
| POST | `/api/presentiq/brand-kits/:id/upload-template` (multipart) |
| POST | `/api/presentiq/brand-kits/:id/upload-font` (multipart) |
| POST | `/api/presentiq/brand-kits/:id/extract-tokens` runs Template Intelligence |

## 4. Projects

| Method | Path |
|---|---|
| POST | `/api/presentiq/projects` |
| GET | `/api/presentiq/projects` |
| GET | `/api/presentiq/projects/:id` |
| PATCH | `/api/presentiq/projects/:id` |
| DELETE | `/api/presentiq/projects/:id` |

## 5. Files

| Method | Path |
|---|---|
| POST | `/api/presentiq/projects/:id/files` (multipart) |
| GET | `/api/presentiq/projects/:id/files` |
| DELETE | `/api/presentiq/files/:id` |

## 6. AI Generation

| Method | Path | Action |
|---|---|---|
| POST | `/api/presentiq/projects/:id/blueprint` | Run Intake → Evidence → Strategy → Storytelling → Architect |
| POST | `/api/presentiq/projects/:id/slides` | Run full deck generation (after blueprint approval) |
| POST | `/api/presentiq/projects/:id/regenerate-slide/:slideId` | One-slide rerun |
| POST | `/api/presentiq/projects/:id/simplify-slide/:slideId` | Revision agent: simplify |
| POST | `/api/presentiq/projects/:id/translate` | Translation agent on full deck |
| POST | `/api/presentiq/projects/:id/quality` | Run QA agent |

## 7. Export

| Method | Path |
|---|---|
| POST | `/api/presentiq/projects/:id/export-pptx` |
| POST | `/api/presentiq/projects/:id/export-pdf` |
| GET  | `/api/presentiq/projects/:id/download/:versionId` |

## 8. Comments

| Method | Path |
|---|---|
| POST | `/api/presentiq/slides/:id/comments` |
| GET | `/api/presentiq/slides/:id/comments` |
| PATCH | `/api/presentiq/comments/:id` |

## 9. Billing

| Method | Path |
|---|---|
| GET | `/api/presentiq/billing/plan` |
| POST | `/api/presentiq/billing/create-checkout-session` |
| POST | `/api/presentiq/billing/customer-portal` |
| POST | `/api/presentiq/billing/webhook` (Stripe) |

## 10. Audit

| Method | Path |
|---|---|
| GET | `/api/presentiq/audit?cursor=&action=` (admin only) |

## Sample: Create Project

`POST /api/presentiq/projects`

```json
{
  "title": "Q3 Steering Committee",
  "audience": "Executive Director — Rail Agency",
  "objective": "Approve EOT and corrective plan",
  "decision_required": "Approve Option 2 corrective plan + 60-day EOT",
  "language_mode": "bilingual",
  "presentation_mode": "rta_boardroom",
  "confidentiality_level": "confidential",
  "target_slide_count": 14,
  "target_duration_min": 25,
  "brand_kit_id": "..."
}
```

Response:

```json
{ "id": "uuid", "status": "draft" }
```

## Sample: Generate Blueprint

`POST /api/presentiq/projects/:id/blueprint`

Streaming progress is sent via Server-Sent Events when `Accept: text/event-stream`. Otherwise the request blocks until completion (max 90 s).

```
event: agent_start
data: {"agent":"intake","traceId":"..."}

event: agent_done
data: {"agent":"intake","durationMs":1200}

event: agent_start
data: {"agent":"evidence"}
...
event: blueprint
data: { ...blueprint json... }
```
