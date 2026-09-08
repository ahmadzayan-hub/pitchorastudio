-- Seed a few public templates
insert into public.templates (id, org_id, name, description, category, body, is_public)
select
  gen_random_uuid(),
  (select id from public.organizations limit 1),
  t.name, t.description, t.category, t.body, true
from (values
  (
    'Code Refactor',
    'Refactor a function for clarity, performance, and tests.',
    'coding',
    '{"sections":["context","goal","constraints","output_format"],"slots":["language","function_name","style_guide"]}'::jsonb
  ),
  (
    'Research Brief',
    'Generate a structured research brief on a topic.',
    'research',
    '{"sections":["topic","audience","depth","format"],"slots":["topic","deadline"]}'::jsonb
  ),
  (
    'Marketing Copy',
    'Write conversion-focused marketing copy.',
    'writing',
    '{"sections":["product","audience","tone","cta"],"slots":["product_name","value_prop"]}'::jsonb
  )
) as t(name, description, category, body)
where exists (select 1 from public.organizations);
