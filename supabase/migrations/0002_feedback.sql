-- =====================================================================
-- Prompt Orchestrator - Public-trial feedback
-- =====================================================================
-- Anonymous and authenticated users can both record a thumbs-up / thumbs-down
-- on a generated prompt, plus an optional free-text note. The platform uses
-- this signal to learn (in real time, in aggregate) which prompt patterns
-- work for which intents and target models.
-- =====================================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  -- nullable so anonymous users (free-tier, no login) can still contribute
  org_id uuid references public.organizations(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  rating smallint not null check (rating in (-1, 0, 1)),
  intent text,
  target_model text,
  locale text,                             -- 'en' | 'ar' | other
  raw_length integer,                      -- length of the raw input
  final_length integer,                    -- length of the final prompt
  comment text,                            -- optional free-text note (≤ 2KB)
  ua text,                                 -- truncated user-agent for QA
  created_at timestamptz not null default now()
);

create index if not exists feedback_intent_idx       on public.feedback(intent);
create index if not exists feedback_target_idx       on public.feedback(target_model);
create index if not exists feedback_created_idx      on public.feedback(created_at desc);

-- Lock down with RLS but allow inserts from any role (anon + authenticated).
alter table public.feedback enable row level security;

drop policy if exists feedback_insert_anyone on public.feedback;
create policy feedback_insert_anyone on public.feedback
  for insert
  to anon, authenticated
  with check (true);

-- Only owners of the org can read aggregate feedback for their org rows.
drop policy if exists feedback_read_owner on public.feedback;
create policy feedback_read_owner on public.feedback
  for select
  to authenticated
  using (
    org_id is null
    or exists (
      select 1 from public.memberships m
      where m.org_id = feedback.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );
