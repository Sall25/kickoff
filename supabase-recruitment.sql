-- Kickoff — recruitment lifecycle. Run once in the SQL editor, after
-- supabase.sql and supabase-onboarding.sql.
--
-- Adds the persistent acceptance state the join request never had:
-- pending -> accepted | rejected, decided only by the project owner.
--
-- Identity model, extended: contributors now authenticate (Supabase magic
-- link) so they get a real inbox and can be notified. Owners still act via
-- ownerEmail-as-capability — no owner accounts. One authenticated actor,
-- the rest capability-based.

/* ------------------------------------------------------------ lifecycle */

alter table public."joinRequests"
  add column if not exists "status" text not null default 'pending'
    check ("status" in ('pending', 'accepted', 'rejected')),
  add column if not exists "decidedAt" timestamptz;

/* ---------------------------------------------- contributor self-read (RLS) */

-- An authenticated contributor may read their OWN requests, matched by the
-- email on the session JWT. This is their inbox / status feed. The row still
-- holds no one else's data to them: the policy scopes every read to
-- email = auth.email(), so the email column grant below is safe.
create policy "contributors read their own requests"
  on public."joinRequests" for select to authenticated
  using (lower("email") = lower(auth.jwt() ->> 'email'));

grant select
  ("id", "projectId", "name", "email", "skills", "message",
   "status", "createdAt", "decidedAt")
  on public."joinRequests" to authenticated;

-- A contributor may withdraw a pending request of their own (pending -> the
-- row is deleted-in-spirit via status). Kept narrow: only their row, only
-- while still pending, only to 'rejected' is NOT allowed here — withdrawal is
-- distinct from an owner rejection, so we leave withdrawal to a future
-- 'withdrawn' status rather than overloading this one. No update policy for
-- now; owners are the only deciders.

/* ------------------------------------------------------ owner inbox (RPC) */

-- Full request list for a project, gated by ownerEmail. Same door as
-- get_onboarding_owner. Returns everything the owner needs to decide:
-- contact email, message, skills, current status.
create or replace function public.list_join_requests(
  p_project_id uuid,
  p_owner_email text
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.projects
    where "id" = p_project_id
      and lower("ownerEmail") = lower(trim(p_owner_email))
  ) then
    raise exception 'owner_mismatch';
  end if;

  return coalesce(
    (
      select json_agg(
        json_build_object(
          'id', r."id",
          'name', r."name",
          'email', r."email",
          'skills', r."skills",
          'message', r."message",
          'status', r."status",
          'createdAt', r."createdAt",
          'decidedAt', r."decidedAt"
        )
        order by r."createdAt" desc
      )
      from public."joinRequests" r
      where r."projectId" = p_project_id
    ),
    '[]'::json
  );
end;
$$;

/* -------------------------------------------------- decision engine (RPC) */

-- The only writer of status. Owner-gated, validates the transition, stamps
-- decidedAt. Idempotent-ish: re-deciding is allowed (an owner can flip a
-- call), which also lets a mistaken reject be corrected.
create or replace function public.decide_join_request(
  p_project_id uuid,
  p_owner_email text,
  p_request_id uuid,
  p_decision text
)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_status text;
  v_decided timestamptz;
begin
  if p_decision not in ('accepted', 'rejected') then
    raise exception 'bad_decision';
  end if;

  if not exists (
    select 1 from public.projects
    where "id" = p_project_id
      and lower("ownerEmail") = lower(trim(p_owner_email))
  ) then
    raise exception 'owner_mismatch';
  end if;

  update public."joinRequests"
    set "status" = p_decision,
        "decidedAt" = now()
    where "id" = p_request_id
      and "projectId" = p_project_id
    returning "status", "decidedAt" into v_status, v_decided;

  if v_status is null then
    raise exception 'not_found';
  end if;

  return json_build_object('status', v_status, 'decidedAt', v_decided);
end;
$$;

/* ---------------------------------------------------- members board (view) */

-- Public roster of accepted contributors. Name + skills only — email is
-- never exposed here, one rung further down the privacy gradient than the
-- owner inbox. Runs as owner (security_invoker off, the default) to read
-- past the joinRequests lockdown, exposing only these three columns.
create view public.project_members as
  select "projectId", "name", "skills"
  from public."joinRequests"
  where "status" = 'accepted';

grant select on public.project_members to anon, authenticated;

/* --------------------------------------------- funnel-closer: kit key (RPC) */

-- Once accepted, a contributor's status page can surface the onboarding kit
-- automatically — no more manually emailing the share link. Given the
-- authenticated caller has an accepted request for the project, return the
-- onboarding shareKey (or null if no kit exists yet). Gated by the session
-- email, so only accepted teammates can pull it.
create or replace function public.get_my_onboarding_key(
  p_project_id uuid
)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_key uuid;
begin
  if not exists (
    select 1 from public."joinRequests"
    where "projectId" = p_project_id
      and "status" = 'accepted'
      and lower("email") = lower(auth.jwt() ->> 'email')
  ) then
    raise exception 'not_accepted';
  end if;

  select "shareKey" into v_key
  from public.onboardings
  where "projectId" = p_project_id;

  return json_build_object('shareKey', v_key); -- shareKey is null if no kit
end;
$$;

grant execute on function public.list_join_requests(uuid, text) to anon, authenticated;
grant execute on function public.decide_join_request(uuid, text, uuid, text) to anon, authenticated;
grant execute on function public.get_my_onboarding_key(uuid) to authenticated;