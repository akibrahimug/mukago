-- Founding Fifty signups from the landing page.
--
-- This table is only ever written to by the Next.js API route using the
-- Supabase service-role key, server-side. The browser holds no Supabase
-- credentials at all, so Row Level Security is enabled with zero policies:
-- that denies all access to the anon/authenticated roles by default and
-- only the service role (which bypasses RLS entirely) can touch this data.
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'landing_page',
  welcome_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

comment on table public.subscribers is
  'Founding Fifty email signups. Written only via the service-role key from the /api/signup route handler — no RLS policies are defined on purpose, which denies all anon/authenticated access.';
