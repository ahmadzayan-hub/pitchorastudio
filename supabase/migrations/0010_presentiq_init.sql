-- =====================================================================
-- PresentIQ — initial schema, RLS policies, indexes, plan seed
-- =====================================================================
-- Conventions:
--   * All PresentIQ tables are prefixed `pq_`
--   * Every tenant row has organization_id + RLS
--   * created_at / updated_at on every table
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ---------------------------------------------------------------------
-- Tenant context helpers
-- ---------------------------------------------------------------------

create or replace function public.pq_current_org() returns uuid
language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb ->> 'org_id',
      ''
    ),
    ''
  )::uuid;
$$;

create or replace function public.pq_current_user_id() returns uuid
language sql stable as $$
  select nullif(coalesce(auth.uid()::text, ''), '')::uuid;
$$;

create or replace function public.pq_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------

create table if not exists public.pq_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'trial' check (plan in ('trial','pro','business','enterprise','gov_private')),
  region text not null default 'global' check (region in ('global','uae')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pq_organizations_updated_at
  before update on public.pq_organizations
  for each row execute procedure public.pq_set_updated_at();

-- ---------------------------------------------------------------------
-- Users (linked to auth.users)
-- ---------------------------------------------------------------------

create table if not exists public.pq_users (
  id uuid primary key,
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'editor' check (role in ('owner','admin','editor','reviewer','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pq_users_org_idx on public.pq_users(organization_id);
create unique index if not exists pq_users_email_idx on public.pq_users(lower(email));

-- ---------------------------------------------------------------------
-- Brand kits
-- ---------------------------------------------------------------------

create table if not exists public.pq_brand_kits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  logos jsonb not null default '[]'::jsonb,
  colors jsonb not null default '{}'::jsonb,
  fonts jsonb not null default '{}'::jsonb,
  typography_rules jsonb not null default '{}'::jsonb,
  layout_rules jsonb not null default '{}'::jsonb,
  chart_rules jsonb not null default '{}'::jsonb,
  terminology jsonb not null default '{}'::jsonb,
  forbidden_patterns jsonb not null default '[]'::jsonb,
  compliance_rules jsonb not null default '{}'::jsonb,
  template_url text,
  template_path text,
  design_tokens jsonb not null default '{}'::jsonb,
  layout_library jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pq_brand_kits_org_idx on public.pq_brand_kits(organization_id);
create unique index if not exists pq_brand_kits_one_default
  on public.pq_brand_kits(organization_id) where is_default;
create trigger pq_brand_kits_updated_at
  before update on public.pq_brand_kits
  for each row execute procedure public.pq_set_updated_at();

-- ---------------------------------------------------------------------
-- Presentation projects
-- ---------------------------------------------------------------------

create table if not exists public.pq_presentation_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  owner_id uuid not null,
  brand_kit_id uuid references public.pq_brand_kits(id) on delete set null,
  title text not null,
  audience text,
  objective text,
  decision_required text,
  language_mode text not null default 'en' check (language_mode in ('en','ar','bilingual')),
  presentation_mode text not null default 'corporate_boardroom',
  confidentiality_level text not null default 'internal'
    check (confidentiality_level in ('public','internal','confidential','strictly_confidential')),
  target_slide_count int default 14,
  target_duration_min int default 25,
  status text not null default 'draft'
    check (status in ('draft','ingesting','blueprint_ready','generating','ready','approved','exported')),
  blueprint jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pq_projects_org_idx on public.pq_presentation_projects(organization_id);
create index if not exists pq_projects_owner_idx on public.pq_presentation_projects(owner_id);
create trigger pq_projects_updated_at
  before update on public.pq_presentation_projects
  for each row execute procedure public.pq_set_updated_at();

-- ---------------------------------------------------------------------
-- Source files
-- ---------------------------------------------------------------------

create table if not exists public.pq_source_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  project_id uuid not null references public.pq_presentation_projects(id) on delete cascade,
  filename text not null,
  file_type text,
  mime_type text,
  size_bytes bigint default 0,
  storage_url text,
  storage_path text,
  extracted_text text,
  extracted_tables jsonb not null default '[]'::jsonb,
  extracted_metadata jsonb not null default '{}'::jsonb,
  ingestion_status text not null default 'pending'
    check (ingestion_status in ('pending','running','done','failed')),
  injection_check_status text not null default 'pending'
    check (injection_check_status in ('pending','clean','blocked')),
  confidentiality_level text not null default 'internal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pq_files_project_idx on public.pq_source_files(project_id);
create trigger pq_files_updated_at
  before update on public.pq_source_files
  for each row execute procedure public.pq_set_updated_at();

-- ---------------------------------------------------------------------
-- Evidence items
-- ---------------------------------------------------------------------

create table if not exists public.pq_evidence_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  project_id uuid not null references public.pq_presentation_projects(id) on delete cascade,
  source_file_id uuid references public.pq_source_files(id) on delete set null,
  claim text not null,
  value text,
  classification text not null
    check (classification in ('fact','user_input','ai_interpretation','professional_assessment','estimate','input_required')),
  confidence numeric not null default 0.7 check (confidence >= 0 and confidence <= 1),
  source_reference jsonb not null default '{}'::jsonb,
  topic_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pq_evidence_project_idx on public.pq_evidence_items(project_id);
create trigger pq_evidence_updated_at
  before update on public.pq_evidence_items
  for each row execute procedure public.pq_set_updated_at();

-- Vector embeddings for evidence (pgvector)
create table if not exists public.pq_evidence_embeddings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  project_id uuid not null references public.pq_presentation_projects(id) on delete cascade,
  evidence_id uuid not null references public.pq_evidence_items(id) on delete cascade,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
create index if not exists pq_evidence_embeddings_org_idx on public.pq_evidence_embeddings(organization_id, project_id);
-- IVFFlat index for cosine similarity (lists tuned later)
do $$ begin
  if not exists (select 1 from pg_indexes where indexname = 'pq_evidence_embeddings_vec_idx') then
    create index pq_evidence_embeddings_vec_idx on public.pq_evidence_embeddings
      using ivfflat (embedding vector_cosine_ops) with (lists = 100);
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Deck versions + slides
-- ---------------------------------------------------------------------

create table if not exists public.pq_deck_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  project_id uuid not null references public.pq_presentation_projects(id) on delete cascade,
  version_number int not null,
  pptx_url text,
  pptx_path text,
  pdf_url text,
  pdf_path text,
  speaker_notes_url text,
  sources_sheet_url text,
  quality_scores jsonb not null default '{}'::jsonb,
  readiness_score numeric not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);
create unique index if not exists pq_deck_versions_unique on public.pq_deck_versions(project_id, version_number);

create table if not exists public.pq_slides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  project_id uuid not null references public.pq_presentation_projects(id) on delete cascade,
  deck_version_id uuid references public.pq_deck_versions(id) on delete set null,
  slide_number int not null,
  title_en text,
  title_ar text,
  purpose text,
  key_message_en text,
  key_message_ar text,
  content_json jsonb not null default '{}'::jsonb,
  visual_json jsonb not null default '{}'::jsonb,
  speaker_notes_en text,
  speaker_notes_ar text,
  animation_plan jsonb not null default '{}'::jsonb,
  evidence_refs uuid[] not null default '{}',
  quality_scores jsonb not null default '{}'::jsonb,
  status text not null default 'generated'
    check (status in ('generated','revised','approved','locked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists pq_slides_unique on public.pq_slides(project_id, slide_number);
create trigger pq_slides_updated_at
  before update on public.pq_slides
  for each row execute procedure public.pq_set_updated_at();

-- ---------------------------------------------------------------------
-- Quality checks
-- ---------------------------------------------------------------------

create table if not exists public.pq_quality_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  project_id uuid not null references public.pq_presentation_projects(id) on delete cascade,
  slide_id uuid references public.pq_slides(id) on delete cascade,
  check_type text not null,
  score numeric not null,
  findings jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists pq_quality_checks_project_idx on public.pq_quality_checks(project_id);

-- ---------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------

create table if not exists public.pq_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  slide_id uuid not null references public.pq_slides(id) on delete cascade,
  user_id uuid,
  body text not null,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pq_comments_slide_idx on public.pq_comments(slide_id);
create trigger pq_comments_updated_at
  before update on public.pq_comments
  for each row execute procedure public.pq_set_updated_at();

-- ---------------------------------------------------------------------
-- Audit log (append-only with hash chain)
-- ---------------------------------------------------------------------

create table if not exists public.pq_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  user_id uuid,
  action text not null,
  object_type text,
  object_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  prev_row_hash text,
  row_hash text,
  created_at timestamptz not null default now()
);
create index if not exists pq_audit_org_time_idx on public.pq_audit_logs(organization_id, created_at desc);

-- ---------------------------------------------------------------------
-- Subscriptions
-- ---------------------------------------------------------------------

create table if not exists public.pq_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.pq_organizations(id) on delete cascade,
  plan text not null default 'trial',
  status text not null default 'trialing',
  provider text not null default 'stripe',
  external_customer_id text,
  external_subscription_id text,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pq_subscriptions_updated_at
  before update on public.pq_subscriptions
  for each row execute procedure public.pq_set_updated_at();

-- ---------------------------------------------------------------------
-- AI cache
-- ---------------------------------------------------------------------

create table if not exists public.pq_ai_cache (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.pq_organizations(id) on delete cascade,
  agent text not null,
  agent_version text not null,
  input_hash text not null,
  output jsonb not null,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);
create unique index if not exists pq_ai_cache_unique
  on public.pq_ai_cache(organization_id, agent, agent_version, input_hash);
create index if not exists pq_ai_cache_expiry on public.pq_ai_cache(expires_at);

-- ---------------------------------------------------------------------
-- Plans (presentation modes catalog)
-- ---------------------------------------------------------------------

create table if not exists public.pq_plans (
  code text primary key,
  name text not null,
  monthly_usd numeric not null default 0,
  annual_usd numeric not null default 0,
  decks_per_month int,
  brand_kits int,
  ai_credits int,
  storage_mb int,
  features jsonb not null default '{}'::jsonb
);

insert into public.pq_plans (code, name, monthly_usd, annual_usd, decks_per_month, brand_kits, ai_credits, storage_mb, features)
values
  ('trial','Free Trial',0,0,3,1,5000,200,'{"trial":true}'::jsonb),
  ('pro','Pro',49,470,50,3,50000,5120,'{}'::jsonb),
  ('business','Business',199,1910,250,25,250000,51200,'{"sso":"oidc"}'::jsonb),
  ('enterprise','Enterprise',0,0,null,null,2000000,512000,'{"sso":"saml","mfa":true,"audit_export":true}'::jsonb),
  ('gov_private','Government Private',0,0,null,null,null,null,'{"region":"uae","private_model":true}'::jsonb)
on conflict (code) do update set
  name = excluded.name,
  monthly_usd = excluded.monthly_usd,
  annual_usd = excluded.annual_usd,
  decks_per_month = excluded.decks_per_month,
  brand_kits = excluded.brand_kits,
  ai_credits = excluded.ai_credits,
  storage_mb = excluded.storage_mb,
  features = excluded.features;

-- =====================================================================
-- Row Level Security
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'pq_organizations',
    'pq_users',
    'pq_brand_kits',
    'pq_presentation_projects',
    'pq_source_files',
    'pq_evidence_items',
    'pq_evidence_embeddings',
    'pq_deck_versions',
    'pq_slides',
    'pq_quality_checks',
    'pq_comments',
    'pq_audit_logs',
    'pq_subscriptions',
    'pq_ai_cache'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- pq_organizations: a user can read/update their own org
drop policy if exists pq_org_read on public.pq_organizations;
create policy pq_org_read on public.pq_organizations
  for select using (id = public.pq_current_org());
drop policy if exists pq_org_update on public.pq_organizations;
create policy pq_org_update on public.pq_organizations
  for update using (id = public.pq_current_org()) with check (id = public.pq_current_org());

-- Generic policies for tenant tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'pq_users',
    'pq_brand_kits',
    'pq_presentation_projects',
    'pq_source_files',
    'pq_evidence_items',
    'pq_evidence_embeddings',
    'pq_deck_versions',
    'pq_slides',
    'pq_quality_checks',
    'pq_comments',
    'pq_audit_logs',
    'pq_subscriptions',
    'pq_ai_cache'
  ] loop
    execute format('drop policy if exists tenant_isolation_read on public.%I;', t);
    execute format($p$create policy tenant_isolation_read on public.%I
      for select using (organization_id = public.pq_current_org());$p$, t);
    execute format('drop policy if exists tenant_isolation_write on public.%I;', t);
    execute format($p$create policy tenant_isolation_write on public.%I
      for all using (organization_id = public.pq_current_org())
      with check (organization_id = public.pq_current_org());$p$, t);
  end loop;
end $$;

-- pq_plans is global / read-only public
drop policy if exists pq_plans_read on public.pq_plans;
alter table public.pq_plans enable row level security;
create policy pq_plans_read on public.pq_plans for select using (true);

-- =====================================================================
-- Storage buckets (idempotent guard for non-Supabase environments)
-- =====================================================================

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('pq-uploads','pq-uploads', false)
    on conflict (id) do nothing;
    insert into storage.buckets (id, name, public)
    values ('pq-renders','pq-renders', false)
    on conflict (id) do nothing;
  end if;
end $$;
