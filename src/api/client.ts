import type { NewJoinRequest, NewProject, Project } from './types'

// Dual-mode client:
// - VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set -> Supabase PostgREST (production)
// - otherwise -> local json-server behind the Vite /api proxy (development)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

if (import.meta.env.PROD && !useSupabase) {
  console.error(
    'Kickoff: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
    'Production builds need Supabase env vars — set them in your host and rebuild.',
  )
}

// Never select ownerEmail: the anon role has no grant on it in Supabase,
// and it should not reach the browser in either mode.
const PROJECT_COLS =
  'id,title,pitch,description,category,skillsNeeded,stage,ownerName,createdAt'

const REST = `${SUPABASE_URL}/rest/v1`

function sbHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

async function ok(res: Response): Promise<void> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}

export function fetchProjects(): Promise<Project[]> {
  if (useSupabase) {
    return fetch(`${REST}/projects?select=${PROJECT_COLS}`, {
      headers: sbHeaders(),
    }).then(json<Project[]>)
  }
  return fetch('/api/projects').then(json<Project[]>)
}

export function fetchProject(id: string): Promise<Project> {
  if (useSupabase) {
    return fetch(
      `${REST}/projects?id=eq.${encodeURIComponent(id)}&select=${PROJECT_COLS}`,
      { headers: sbHeaders({ Accept: 'application/vnd.pgrst.object+json' }) },
    ).then(json<Project>)
  }
  return fetch(`/api/projects/${id}`).then(json<Project>)
}

export function createProject(input: NewProject): Promise<Project> {
  const record = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  if (useSupabase) {
    return fetch(`${REST}/projects?select=${PROJECT_COLS}`, {
      method: 'POST',
      headers: sbHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(record),
    })
      .then(json<Project[]>)
      .then(([created]) => created)
  }
  return fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  }).then(json<Project>)
}

export function fetchJoinRequestCount(projectId: string): Promise<number> {
  if (useSupabase) {
    // join_request_counts is a count-only view; the joinRequests table itself
    // is not readable by anon (it holds contact emails).
    return fetch(
      `${REST}/join_request_counts?projectId=eq.${encodeURIComponent(projectId)}&select=count`,
      { headers: sbHeaders() },
    )
      .then(json<{ count: number }[]>)
      .then((rows) => rows[0]?.count ?? 0)
  }
  return fetch(`/api/joinRequests?projectId=${encodeURIComponent(projectId)}`)
    .then(json<unknown[]>)
    .then((rows) => rows.length)
}

export function createJoinRequest(input: NewJoinRequest): Promise<void> {
  const record = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  if (useSupabase) {
    return fetch(`${REST}/joinRequests`, {
      method: 'POST',
      headers: sbHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify(record),
    }).then(ok)
  }
  return fetch('/api/joinRequests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  }).then(ok)
}