-- Kickoff — onboarding kits. Run once in the SQL editor of an existing
-- Kickoff Supabase project (after supabase.sql).
--
-- Access model: the table has NO direct API access. Everything goes through
-- three security-definer functions:
--
--   get_onboarding(projectId, shareKey)         teammates, via the private link
--   get_onboarding_owner(projectId, ownerEmail) the creator, to load the builder
--   upsert_onboarding(projectId, ownerEmail, content) the creator, to save
--
-- ownerEmail is the creator credential: it is insert-only everywhere else
-- (no select grant), so only the person who published the project knows it.
-- shareKey is minted server-side and only ever revealed to a verified owner.

create table public.onboardings (
  "projectId" uuid primary key references public.projects ("id") on delete cascade,
  "shareKey"  uuid not null default gen_random_uuid(),
  "content"   jsonb not null,
  "updatedAt" timestamptz not null default now()
);

alter table public.onboardings enable row level security;
-- Deliberately NO policies and no grants: the RPCs below are the only door.
revoke all on public.onboardings from anon, authenticated;

-- Teammate read. Returns null when the key doesn't match — indistinguishable
-- from "no kit yet" on purpose, so the endpoint can't be used to probe which
-- projects have kits.
create or replace function public.get_onboarding(
  p_project_id uuid,
  p_share_key uuid
)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'projectId', o."projectId",
    'content',   o."content",
    'updatedAt', o."updatedAt"
  )
  from public.onboardings o
  where o."projectId" = p_project_id
    and o."shareKey" = p_share_key
$$;

-- Owner read for the builder. Raises 'owner_mismatch' when the email doesn't
-- match the project, so the client can distinguish a bad credential from a
-- kit that simply doesn't exist yet.
create or replace function public.get_onboarding_owner(
  p_project_id uuid,
  p_owner_email text
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_row public.onboardings;
begin
  if not exists (
    select 1 from public.projects
    where "id" = p_project_id
      and lower("ownerEmail") = lower(trim(p_owner_email))
  ) then
    raise exception 'owner_mismatch';
  end if;

  select * into v_row from public.onboardings where "projectId" = p_project_id;

  if v_row."projectId" is null then
    return json_build_object('exists', false);
  end if;

  return json_build_object(
    'exists', true,
    'content', v_row."content",
    'shareKey', v_row."shareKey",
    'updatedAt', v_row."updatedAt"
  );
end;
$$;

-- Owner create/update. The shareKey survives updates, so acceptance links
-- already sent keep working after edits.
create or replace function public.upsert_onboarding(
  p_project_id uuid,
  p_owner_email text,
  p_content jsonb
)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_key uuid;
  v_updated timestamptz;
begin
  if not exists (
    select 1 from public.projects
    where "id" = p_project_id
      and lower("ownerEmail") = lower(trim(p_owner_email))
  ) then
    raise exception 'owner_mismatch';
  end if;

  insert into public.onboardings ("projectId", "content")
  values (p_project_id, p_content)
  on conflict ("projectId") do update
    set "content" = excluded."content",
        "updatedAt" = now()
  returning "shareKey", "updatedAt" into v_key, v_updated;

  return json_build_object('shareKey', v_key, 'updatedAt', v_updated);
end;
$$;

grant execute on function public.get_onboarding(uuid, uuid) to anon, authenticated;
grant execute on function public.get_onboarding_owner(uuid, text) to anon, authenticated;
grant execute on function public.upsert_onboarding(uuid, text, jsonb) to anon, authenticated;
