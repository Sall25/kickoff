import { getAccessToken } from './supabase'
import type {
  JoinRequest,
  MyRequest,
  NewJoinRequest,
  NewProject,
  Onboarding,
  OnboardingContent,
  Project,
  ProjectMember,
  RequestStatus,
} from './types'

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

// Contributor-authenticated headers: the anon key as apikey, the user's JWT
// as the bearer, so RLS sees auth.email(). Falls back to the anon bearer when
// signed out (the call will then return nothing under RLS, which is correct).
async function authedHeaders(
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return {
    apikey: SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${token ?? SUPABASE_ANON_KEY}`,
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

/* ------------------------------------------------------------ onboarding */

// The onboardings table has NO direct anon access in Supabase. Everything
// goes through three security-definer RPCs (see supabase-onboarding.sql):
//
//   get_onboarding(projectId, shareKey)        -> read with the share key
//   get_onboarding_owner(projectId, ownerEmail) -> read for editing, returns shareKey
//   upsert_onboarding(projectId, ownerEmail, content) -> create/update, returns shareKey
//
// ownerEmail acts as the creator credential: it is insert-only everywhere
// else in the system, so only the person who published the project knows it.
// Errors surface as Error('wrong_key' | 'not_found' | 'owner_mismatch') so
// the UI can translate them.

export type OwnerOnboarding = {
  onboarding: Onboarding | null
  shareKey: string | null
}

// json-server row shape (dev only). `id` doubles as the projectId so the
// resource stays addressable at /onboardings/:projectId.
type LocalOnboardingRow = {
  id: string
  projectId: string
  shareKey: string
  content: OnboardingContent
  updatedAt: string
}

async function rpc<T>(
  name: string,
  body: Record<string, unknown>,
  authed = false,
): Promise<T> {
  const headers = authed ? await authedHeaders() : sbHeaders()
  return fetch(`${REST}/rpc/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(async (res) => {
    if (!res.ok) {
      // Postgres `raise exception 'owner_mismatch'` etc. lands in `message`.
      const detail = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      throw new Error(detail?.message ?? `${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<T>
  })
}

async function fetchLocalOnboardingRow(
  projectId: string,
): Promise<LocalOnboardingRow | null> {
  const res = await fetch(`/api/onboardings/${encodeURIComponent(projectId)}`)
  if (res.status === 404) return null
  return json<LocalOnboardingRow>(res)
}

async function verifyLocalOwner(
  projectId: string,
  ownerEmail: string,
): Promise<void> {
  // In dev, json-server returns the full record including ownerEmail.
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`)
  if (res.status === 404) throw new Error('not_found')
  const project = await json<Project & { ownerEmail?: string }>(res)
  const stored = (project.ownerEmail ?? '').trim().toLowerCase()
  if (!stored || stored !== ownerEmail.trim().toLowerCase()) {
    throw new Error('owner_mismatch')
  }
}

export function fetchOnboarding(
  projectId: string,
  shareKey: string,
): Promise<Onboarding> {
  if (useSupabase) {
    return rpc<{
      projectId: string
      content: OnboardingContent
      updatedAt: string
    }>('get_onboarding', {
      p_project_id: projectId,
      p_share_key: shareKey,
    }).then((row) => {
      if (!row) throw new Error('wrong_key')
      return { projectId: row.projectId, content: row.content, updatedAt: row.updatedAt }
    })
  }
  return fetchLocalOnboardingRow(projectId).then((row) => {
    if (!row) throw new Error('not_found')
    if (row.shareKey !== shareKey) throw new Error('wrong_key')
    return { projectId: row.projectId, content: row.content, updatedAt: row.updatedAt }
  })
}

export function fetchOnboardingOwner(
  projectId: string,
  ownerEmail: string,
): Promise<OwnerOnboarding> {
  if (useSupabase) {
    return rpc<{
      exists: boolean
      content?: OnboardingContent
      shareKey?: string
      updatedAt?: string
    }>('get_onboarding_owner', {
      p_project_id: projectId,
      p_owner_email: ownerEmail,
    }).then((row) =>
      row.exists
        ? {
          onboarding: {
            projectId,
            content: row.content!,
            updatedAt: row.updatedAt!,
          },
          shareKey: row.shareKey!,
        }
        : { onboarding: null, shareKey: null },
    )
  }
  return verifyLocalOwner(projectId, ownerEmail)
    .then(() => fetchLocalOnboardingRow(projectId))
    .then((row) =>
      row
        ? {
          onboarding: {
            projectId,
            content: row.content,
            updatedAt: row.updatedAt,
          },
          shareKey: row.shareKey,
        }
        : { onboarding: null, shareKey: null },
    )
}

export function saveOnboarding(
  projectId: string,
  ownerEmail: string,
  content: OnboardingContent,
): Promise<{ shareKey: string; updatedAt: string }> {
  if (useSupabase) {
    return rpc<{ shareKey: string; updatedAt: string }>('upsert_onboarding', {
      p_project_id: projectId,
      p_owner_email: ownerEmail,
      p_content: content,
    })
  }
  return verifyLocalOwner(projectId, ownerEmail)
    .then(() => fetchLocalOnboardingRow(projectId))
    .then((existing) => {
      const updatedAt = new Date().toISOString()
      const record: LocalOnboardingRow = {
        id: projectId,
        projectId,
        shareKey: existing?.shareKey ?? crypto.randomUUID(),
        content,
        updatedAt,
      }
      const target = existing
        ? `/api/onboardings/${encodeURIComponent(projectId)}`
        : '/api/onboardings'
      return fetch(target, {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
        .then(ok)
        .then(() => ({ shareKey: record.shareKey, updatedAt }))
    })
}

/* ------------------------------------------------------------ recruitment */

// The join request now carries a lifecycle: pending -> accepted | rejected,
// decided only by the owner. Reads split by audience — owners see full
// requests (RPC gated by ownerEmail), contributors see their own rows (RLS
// by session email), the public sees the accepted roster (name + skills).

function normalizeStatus(value: unknown): RequestStatus {
  return value === 'accepted' || value === 'rejected' ? value : 'pending'
}

// Owner inbox — every request for a project, newest first.
export function listJoinRequests(
  projectId: string,
  ownerEmail: string,
): Promise<JoinRequest[]> {
  if (useSupabase) {
    return rpc<JoinRequest[]>('list_join_requests', {
      p_project_id: projectId,
      p_owner_email: ownerEmail,
    })
  }
  return verifyLocalOwner(projectId, ownerEmail)
    .then(() =>
      fetch(
        `/api/joinRequests?projectId=${encodeURIComponent(projectId)}&_sort=createdAt&_order=desc`,
      ).then(json<Array<Record<string, unknown>>>),
    )
    .then((rows) =>
      rows.map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ''),
        email: String(r.email ?? ''),
        skills: (r.skills as string[]) ?? [],
        message: String(r.message ?? ''),
        status: normalizeStatus(r.status),
        createdAt: String(r.createdAt ?? ''),
        decidedAt: (r.decidedAt as string | null) ?? null,
      })),
    )
}

// The only writer of status.
export function decideJoinRequest(
  projectId: string,
  ownerEmail: string,
  requestId: string,
  decision: Exclude<RequestStatus, 'pending'>,
): Promise<{ status: RequestStatus; decidedAt: string }> {
  if (useSupabase) {
    return rpc<{ status: RequestStatus; decidedAt: string }>(
      'decide_join_request',
      {
        p_project_id: projectId,
        p_owner_email: ownerEmail,
        p_request_id: requestId,
        p_decision: decision,
      },
    )
  }
  return verifyLocalOwner(projectId, ownerEmail).then(() => {
    const decidedAt = new Date().toISOString()
    return fetch(`/api/joinRequests/${encodeURIComponent(requestId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: decision, decidedAt }),
    })
      .then(ok)
      .then(() => ({ status: decision, decidedAt }))
  })
}

// Contributor inbox — the requester's own applications. In prod, RLS scopes
// the read to the session email; in dev we filter json-server by it.
export function fetchMyRequests(email: string): Promise<MyRequest[]> {
  const shape = (r: Record<string, unknown>): MyRequest => ({
    id: String(r.id),
    projectId: String(r.projectId),
    name: String(r.name ?? ''),
    skills: (r.skills as string[]) ?? [],
    message: String(r.message ?? ''),
    status: normalizeStatus(r.status),
    createdAt: String(r.createdAt ?? ''),
    decidedAt: (r.decidedAt as string | null) ?? null,
  })
  if (useSupabase) {
    return authedHeaders().then((headers) =>
      fetch(
        `${REST}/joinRequests?select=id,projectId,name,skills,message,status,createdAt,decidedAt&order=createdAt.desc`,
        { headers },
      )
        .then(json<Array<Record<string, unknown>>>)
        .then((rows) => rows.map(shape)),
    )
  }
  return fetch(`/api/joinRequests?email=${encodeURIComponent(email)}&_sort=createdAt&_order=desc`)
    .then(json<Array<Record<string, unknown>>>)
    .then((rows) => rows.map(shape))
}

// Public members board — accepted contributors, name + skills only.
export function fetchProjectMembers(
  projectId: string,
): Promise<ProjectMember[]> {
  if (useSupabase) {
    return fetch(
      `${REST}/project_members?projectId=eq.${encodeURIComponent(projectId)}&select=name,skills`,
      { headers: sbHeaders() },
    ).then(json<ProjectMember[]>)
  }
  return fetch(
    `/api/joinRequests?projectId=${encodeURIComponent(projectId)}&status=accepted`,
  )
    .then(json<Array<Record<string, unknown>>>)
    .then((rows) =>
      rows.map((r) => ({
        name: String(r.name ?? ''),
        skills: (r.skills as string[]) ?? [],
      })),
    )
}

// Funnel-closer — an accepted contributor pulls the onboarding share key so
// their status page can link straight into the kit. Throws 'not_accepted'
// when the caller has no accepted request for the project.
export function fetchMyOnboardingKey(
  projectId: string,
  email: string,
): Promise<{ shareKey: string | null }> {
  if (useSupabase) {
    return rpc<{ shareKey: string | null }>(
      'get_my_onboarding_key',
      { p_project_id: projectId },
      true,
    )
  }
  return fetch(
    `/api/joinRequests?projectId=${encodeURIComponent(projectId)}&email=${encodeURIComponent(email)}&status=accepted`,
  )
    .then(json<unknown[]>)
    .then((rows) => {
      if (rows.length === 0) throw new Error('not_accepted')
      return fetchLocalOnboardingRow(projectId)
    })
    .then((row) => ({ shareKey: row?.shareKey ?? null }))
}
