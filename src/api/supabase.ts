import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// supabase-js is used ONLY for contributor auth (magic link + session).
// All data reads/writes still go through src/api/client.ts — this file just
// owns the auth client and hands out the access token for authenticated
// requests. In dev (json-server) there is no Supabase project, so `supabase`
// is null and the session is a localStorage stub (see useSession).

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase: SupabaseClient | null = useSupabase
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // The magic-link redirect lands back on the app with the session in
      // the URL fragment; detect and store it automatically.
      detectSessionInUrl: true,
    },
  })
  : null

// The contributor's JWT for RLS-gated PostgREST calls. Null in dev or when
// signed out — callers fall back to the json-server path or skip.
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
