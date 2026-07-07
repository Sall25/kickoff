# Kickoff

Where projects find their people. Post the project you can't stop thinking
about, or lend your skills to one that's already rolling.

## Local dev

Two terminals:

```
npm install
npm run api    # json-server on :3001
npm run dev    # vite on :5173
```

The Vite dev server proxies `/api/*` to json-server, so no CORS setup needed.
Without Supabase env vars the app always uses json-server.

## Launch (Supabase + Vercel)

**1. Backend — Supabase (~5 min)**
- Create a project at supabase.com
- SQL editor → paste `supabase.sql` → Run
- SQL editor → paste `supabase-onboarding.sql` → Run (onboarding kits)
- SQL editor → paste `supabase-recruitment.sql` → Run (join-request lifecycle, inboxes, members board)
- Authentication → enable **Email / magic link**, and add your deployed URL to the redirect allow-list (contributor sign-in)
- Optional: `supabase-notifications.sql` to email contributors on a decision — see the file header for the Resend setup
- Settings → API: copy the **Project URL** and **anon public** key

**2. Frontend — Vercel**
- Push this repo to GitHub, import it in Vercel (framework preset: Vite)
- Add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Deploy. `vercel.json` rewrites deep links (`/projects/:id`) to the SPA.

The client is dual-mode (`src/api/client.ts`): env vars present → Supabase
PostgREST; absent → local json-server. No code changes between dev and prod.

**Privacy at launch:**
- `ownerEmail` is insert-only — the anon role has no select grant on that column
- `joinRequests` rows are never readable; the UI gets counts from the
  `join_request_counts` view only
- No update/delete is possible through the public API

## Recruitment

The join request has a lifecycle: **pending → accepted | rejected**, decided
only by the owner, plus contributor **withdrawal** (pending → withdrawn).

- **Contributors** sign in with a magic link (email only, no password) to get
  an inbox at `/inbox` — their applications, live status, and the onboarding
  kit link the moment they're accepted. Owners never sign in; they act via
  `ownerEmail`-as-capability, same as onboarding.
- **Owners** review requests at `/projects/:id/requests` (email-gated) and
  accept/decline. Accepting adds the contributor to the public members board.
- **Members board** on the project page is public — accepted contributors'
  name + skills only, never email. One rung further down the privacy gradient
  than the owner inbox.
- Reads split by audience via `supabase-recruitment.sql`: owner inbox +
  decision through `ownerEmail`-gated RPCs, contributor inbox through RLS on
  `auth.email()`, members through a public name+skills view, and
  `get_my_onboarding_key` handing accepted contributors the kit link — which
  closes the Discover → Recruit → Onboard funnel into one rail.
- Optional decision emails via `supabase-notifications.sql` (Resend + a
  Postgres trigger). Without it, contributors still see status in their inbox.

When a creator accepts a contributor, they can send an **onboarding kit**: a
welcome note, the toolbox (repos, design files…), collaboration apps, working
days and core hours, first steps, and notes. Downloadable as PDF — the whole
kit or section by section.

- Build it at `/projects/:id/onboarding/edit`. The gate is the project's
  `ownerEmail`, verified server-side — it acts as the creator credential since
  only the person who published the project knows it.
- Saving returns a private share link (`/projects/:id/onboarding?k=…`) to send
  with each acceptance. The key survives edits, so links already sent keep
  working.
- The `onboardings` table has no direct API access; three security-definer
  RPCs in `supabase-onboarding.sql` are the only door. A wrong share key is
  indistinguishable from "no kit yet", so the endpoint can't be probed.

## Stack

React 18 · TypeScript · Vite · TanStack Query v5 · TanStack Location · SCSS ·
Supabase (prod) / json-server (dev)