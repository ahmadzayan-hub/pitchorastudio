# PresentIQ — Database Schema

## 1. Overview

All tables live in the `public` schema and are prefixed `pq_` so PresentIQ tables coexist with the existing app's schema. Every tenant-scoped table has:

- `id uuid primary key`
- `organization_id uuid not null references pq_organizations(id) on delete cascade`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Postgres **Row Level Security** policy `tenant_isolation`.

## 2. Entities

### `pq_organizations`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| slug | text unique | tenant slug |
| plan | text | `trial \| pro \| business \| enterprise \| gov_private` |
| region | text | `global \| uae` |
| settings | jsonb | feature flags |

### `pq_users` (links Supabase auth.users → org)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK = `auth.users.id` |
| organization_id | uuid | |
| name | text | |
| email | text | |
| role | text | `owner \| admin \| editor \| reviewer \| viewer` |

### `pq_brand_kits`
Brand kit per organisation. One can be marked `is_default`.

| Column | Type |
|---|---|
| id, organization_id, name, is_default |
| logos | jsonb (array of `{url, placement, locale}`) |
| colors | jsonb (`{primary, secondary, palette[], background}`) |
| fonts | jsonb (`{en_primary, en_fallback, ar_primary, ar_fallback}`) |
| typography_rules | jsonb (`{title_size_range, body_size_range, line_height}`) |
| layout_rules | jsonb |
| chart_rules | jsonb |
| terminology | jsonb (`{approved:[], forbidden:[], en_to_ar:{}}`) |
| forbidden_patterns | jsonb (regex strings) |
| compliance_rules | jsonb |
| template_url | text (uploaded PPTX template) |
| design_tokens | jsonb (extracted by Template Intelligence) |
| layout_library | jsonb (extracted layouts) |

### `pq_presentation_projects`
| Column | Type |
|---|---|
| id, organization_id, owner_id, brand_kit_id |
| title | text |
| audience | text |
| objective | text |
| decision_required | text |
| language_mode | text (`en \| ar \| bilingual`) |
| presentation_mode | text (enum of 12 modes) |
| confidentiality_level | text (`public \| internal \| confidential \| strictly_confidential`) |
| target_slide_count | int |
| target_duration_min | int |
| status | text (`draft \| ingesting \| blueprint_ready \| generating \| ready \| approved \| exported`) |
| blueprint | jsonb |

### `pq_source_files`
| Column | Type |
|---|---|
| id, organization_id, project_id |
| filename, file_type, mime_type, size_bytes |
| storage_url (signed read), storage_path |
| extracted_text | text |
| extracted_tables | jsonb |
| extracted_metadata | jsonb |
| ingestion_status | text |
| injection_check_status | text (`pending \| clean \| blocked`) |
| confidentiality_level | text |

### `pq_evidence_items`
| Column | Type |
|---|---|
| id, organization_id, project_id, source_file_id |
| claim | text |
| value | text |
| classification | text (`fact \| user_input \| ai_interpretation \| professional_assessment \| estimate \| input_required`) |
| confidence | numeric (0..1) |
| source_reference | jsonb (`{file_id, page, span}`) |
| topic_tags | text[] |

### `pq_evidence_embeddings`
| Column | Type |
|---|---|
| id, organization_id, evidence_id, project_id |
| embedding | vector(1536) (pgvector) |

### `pq_slides`
| Column | Type |
|---|---|
| id, organization_id, project_id, deck_version_id |
| slide_number | int |
| title_en | text |
| title_ar | text |
| purpose | text |
| key_message_en | text |
| key_message_ar | text |
| content_json | jsonb (structured slide model) |
| visual_json | jsonb (visual plan + chart spec) |
| speaker_notes_en | text |
| speaker_notes_ar | text |
| animation_plan | jsonb |
| evidence_refs | uuid[] (references `pq_evidence_items.id`) |
| quality_scores | jsonb |
| status | text (`generated \| revised \| approved \| locked`) |

### `pq_deck_versions`
| Column | Type |
|---|---|
| id, organization_id, project_id |
| version_number | int |
| pptx_url | text |
| pdf_url | text |
| speaker_notes_url | text |
| sources_sheet_url | text |
| quality_scores | jsonb |
| readiness_score | numeric |
| created_by | uuid |

### `pq_quality_checks`
| Column | Type |
|---|---|
| id, organization_id, project_id, slide_id |
| check_type | text (10 dimensions) |
| score | numeric (0..100) |
| findings | jsonb |
| recommendations | jsonb |

### `pq_comments`
| Column | Type |
|---|---|
| id, organization_id, slide_id, user_id |
| body | text |
| status | text (`open \| resolved`) |

### `pq_audit_logs` (append-only)
| Column | Type |
|---|---|
| id, organization_id, user_id, action, object_type, object_id, metadata, created_at |

### `pq_subscriptions`
| Column | Type |
|---|---|
| id, organization_id, plan, status, provider (`stripe`), external_customer_id, external_subscription_id, current_period_end |

### `pq_ai_cache`
| Column | Type |
|---|---|
| id, organization_id, agent, version, input_hash unique, output, expires_at |

## 3. RLS Policies

For every tenant table:

```sql
alter table pq_<t> enable row level security;
create policy tenant_read on pq_<t> for select using (organization_id = pq_current_org());
create policy tenant_write on pq_<t> for all using (organization_id = pq_current_org())
                                    with check (organization_id = pq_current_org());
```

`pq_current_org()` is a `SECURITY DEFINER` function that reads the JWT claim `org_id` (set by the API after resolving the user's org).

## 4. Indexes

- `pq_evidence_embeddings.embedding` IVFFlat (cosine).
- `pq_slides (project_id, slide_number)` unique composite.
- `pq_audit_logs (organization_id, created_at desc)`.
- `pq_ai_cache (organization_id, agent, input_hash)` unique.

## 5. Migrations

Initial migration: `supabase/migrations/0010_presentiq_init.sql` (full DDL + RLS + seed plans).
