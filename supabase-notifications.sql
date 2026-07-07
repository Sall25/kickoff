-- Kickoff — decision notifications (OPTIONAL, prod-only).
-- Emails a contributor when their request is accepted or declined.
-- Run after supabase-recruitment.sql.
--
-- The code here is complete; three things are on you (all one-time):
--
--   1. Create a Resend account (resend.com) and verify a sending domain.
--   2. Store three secrets in Supabase Vault (SQL editor, replace values):
--
--        select vault.create_secret('re_your_key_here',              'RESEND_API_KEY');
--        select vault.create_secret('Kickoff <hello@yourdomain.com>', 'KO_FROM_EMAIL');
--        select vault.create_secret('https://your-app.vercel.app',    'KO_APP_URL');
--
--   3. Run this file.
--
-- If the secrets aren't set, the trigger no-ops silently — decisions still
-- work, they just don't email. Dev (json-server) never reaches this path.
--
-- Delivery is fire-and-forget via pg_net: a failed send never blocks or
-- rolls back the owner's decision.

create extension if not exists pg_net;

create or replace function public.notify_decision()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key   text;
  v_from  text;
  v_app   text;
  v_title text;
  v_subject text;
  v_html  text;
  v_word_en text;
  v_word_fr text;
  v_key_kit text;
  v_link  text;
  v_cta_en text;
  v_cta_fr text;
begin
  -- Only real decisions, and only when status actually changes.
  if new."status" not in ('accepted', 'rejected')
     or new."status" is not distinct from old."status" then
    return new;
  end if;

  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'RESEND_API_KEY';
  if v_key is null then
    return new; -- not configured; skip silently
  end if;

  select decrypted_secret into v_from
    from vault.decrypted_secrets where name = 'KO_FROM_EMAIL';
  select decrypted_secret into v_app
    from vault.decrypted_secrets where name = 'KO_APP_URL';

  select "title" into v_title
    from public.projects where "id" = new."projectId";
  v_title := coalesce(v_title, 'a project');

  -- Where the email lands them. On acceptance, if a kit exists, deep-link
  -- straight into it with the share key (capability-gated, no login needed) —
  -- they land on THIS project's onboarding. Otherwise (declined, or kit not
  -- built yet) send them to their inbox.
  if new."status" = 'accepted' then
    v_word_en := 'accepted';     v_word_fr := 'acceptée';

    select "shareKey"::text into v_key_kit
      from public.onboardings where "projectId" = new."projectId";

    if v_key_kit is not null then
      v_link := format('%s/projects/%s/onboarding?k=%s',
                       v_app, new."projectId", v_key_kit);
      v_cta_en := 'Open your onboarding kit';
      v_cta_fr := 'Ouvrir votre kit d''accueil';
    else
      v_link := v_app || '/inbox';
      v_cta_en := 'View your requests';
      v_cta_fr := 'Voir vos demandes';
    end if;
  else
    v_word_en := 'not selected'; v_word_fr := 'non retenue';
    v_link := v_app || '/inbox';
    v_cta_en := 'View your requests';
    v_cta_fr := 'Voir vos demandes';
  end if;

  v_subject := format('Your request to %s — %s', v_title, v_word_en);

  -- Bilingual, matching the app. Kept plain so any client renders it.
  v_html := format(
    '<p>Your request to join <strong>%s</strong> was %s.</p>'
    '<p><a href="%s">%s</a></p>'
    '<hr>'
    '<p>Votre demande pour rejoindre <strong>%s</strong> a été %s.</p>'
    '<p><a href="%s">%s</a></p>',
    v_title, v_word_en, v_link, v_cta_en,
    v_title, v_word_fr, v_link, v_cta_fr
  );

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', v_from,
      'to', new."email",
      'subject', v_subject,
      'html', v_html
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_decision on public."joinRequests";
create trigger trg_notify_decision
  after update of "status" on public."joinRequests"
  for each row
  execute function public.notify_decision();