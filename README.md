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

## Onboarding kits

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