-- Kickoff — Supabase schema. Paste into the SQL editor and run once.
-- Column names are quoted camelCase on purpose: they match the frontend
-- payloads exactly, so the client needs no field mapping.

create extension if not exists pgcrypto;

create table public.projects (
  "id"           uuid primary key default gen_random_uuid(),
  "title"        text not null,
  "pitch"        text not null,
  "description"  text not null,
  "category"     text not null,
  "skillsNeeded" text[] not null default '{}',
  "stage"        text not null check ("stage" in ('idea', 'building', 'launching')),
  "ownerName"    text not null,
  "ownerEmail"   text not null,
  "createdAt"    timestamptz not null default now()
);

create table public."joinRequests" (
  "id"        uuid primary key default gen_random_uuid(),
  "projectId" uuid not null references public.projects ("id") on delete cascade,
  "name"      text not null,
  "email"     text not null,
  "skills"    text[] not null default '{}',
  "message"   text not null,
  "createdAt" timestamptz not null default now()
);

-- Row Level Security: anyone can read projects and create rows; nobody
-- can update or delete through the API.
alter table public.projects enable row level security;
alter table public."joinRequests" enable row level security;

create policy "anyone can read projects"
  on public.projects for select to anon, authenticated using (true);

create policy "anyone can post a project"
  on public.projects for insert to anon, authenticated with check (true);

create policy "anyone can send a join request"
  on public."joinRequests" for insert to anon, authenticated with check (true);
-- Deliberately NO select policy on joinRequests: it holds contact emails.

-- Column-level privacy: ownerEmail is writable but never readable via the API.
revoke select, update, delete on public.projects from anon, authenticated;
grant select ("id", "title", "pitch", "description", "category",
              "skillsNeeded", "stage", "ownerName", "createdAt")
  on public.projects to anon, authenticated;

revoke select, update, delete on public."joinRequests" from anon, authenticated;

-- Count-only view so the UI can show "N people asked to join" without any
-- access to the underlying rows. security_invoker stays off (default) on
-- purpose: the view runs as its owner, bypassing the joinRequests lockdown
-- for this one aggregate.
create view public.join_request_counts as
  select "projectId", count(*)::int as "count"
  from public."joinRequests"
  group by "projectId";

grant select on public.join_request_counts to anon, authenticated;

-- Optional: a couple of seed rows so the board isn't empty at launch.
insert into public.projects
  ("title", "pitch", "description", "category", "skillsNeeded", "stage", "ownerName", "ownerEmail")
values
  ('Dakar Surf Report',
   'Daily swell, wind, and tide forecasts for every break from Ngor to Ouakam.',
   E'Surfers here rely on word of mouth and generic global forecast apps that don''t know the local breaks. I want a lightweight PWA that combines open marine data with community reports from people actually in the water.\n\nI''ve got the data pipeline sketched out — looking for hands on the frontend and someone who knows the breaks.',
   'web', array['react', 'design', 'surfing'], 'building',
   'Awa', 'awa@example.com'),
  ('Open Repair Atlas',
   'A community-edited map of repair shops, fixers, and spare-part markets.',
   E'Throwing things away should be the last resort. This is a map of every place that can fix a phone, a fan, a bike — starting with one city and growing by contribution.\n\nNeeds a data model for crowd edits and a lot of ground-truthing.',
   'community', array['mapping', 'react', 'field research'], 'idea',
   'Moussa', 'moussa@example.com');