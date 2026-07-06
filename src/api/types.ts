export type Stage = 'idea' | 'building' | 'launching'

export type Category =
  | 'web'
  | 'mobile'
  | 'hardware'
  | 'games'
  | 'community'
  | 'data'

// What reads return. ownerEmail is intentionally absent: it is never
// exposed to visitors (column-level grant in Supabase, ignored locally).
export type Project = {
  id: string
  title: string
  pitch: string
  description: string
  category: Category
  skillsNeeded: string[]
  stage: Stage
  ownerName: string
  createdAt: string
}

export type NewProject = Omit<Project, 'id' | 'createdAt'> & {
  ownerEmail: string
}

export type NewJoinRequest = {
  projectId: string
  name: string
  email: string
  skills: string[]
  message: string
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected'

// Owner inbox row — one project's requests, full contact detail.
export type JoinRequest = {
  id: string
  name: string
  email: string
  skills: string[]
  message: string
  status: RequestStatus
  createdAt: string
  decidedAt: string | null
}

// Contributor inbox row — the requester's own applications across projects.
// Carries projectId to link back; no email (it's always their own).
export type MyRequest = {
  id: string
  projectId: string
  name: string
  skills: string[]
  message: string
  status: RequestStatus
  createdAt: string
  decidedAt: string | null
}

// Public members board entry — name + skills only, never email.
export type ProjectMember = {
  name: string
  skills: string[]
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'games', label: 'Games' },
  { value: 'community', label: 'Community' },
  { value: 'data', label: 'Data' },
]

export const STAGES: { value: Stage; label: string; hint: string }[] = [
  { value: 'idea', label: 'Idea', hint: 'Still on paper' },
  { value: 'building', label: 'Building', hint: 'Work in progress' },
  { value: 'launching', label: 'Launching', hint: 'Nearly out the door' },
]

/* ------------------------------------------------------------ onboarding */

// Icon identity for a tool/app link. Brand labels are not translated
// (they are proper nouns), so they live here rather than in i18n.
export type LinkKind =
  | 'github'
  | 'figma'
  | 'slack'
  | 'discord'
  | 'notion'
  | 'trello'
  | 'linear'
  | 'zoom'
  | 'meet'
  | 'other'

export const LINK_KINDS: { value: LinkKind; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'figma', label: 'Figma' },
  { value: 'slack', label: 'Slack' },
  { value: 'discord', label: 'Discord' },
  { value: 'notion', label: 'Notion' },
  { value: 'trello', label: 'Trello' },
  { value: 'linear', label: 'Linear' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'meet', label: 'Google Meet' },
  { value: 'other', label: 'Other' },
]

export type OnboardingLink = {
  id: string
  name: string
  url: string
  kind: LinkKind
}

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const DAYS: Day[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export type OnboardingSchedule = {
  days: Day[]
  coreStart: string // "14:00", or '' when unset
  coreEnd: string
  timezone: string
}

export type ChecklistItem = {
  id: string
  text: string
  url: string // optional in spirit: '' when absent
}

export type NoteSection = {
  id: string
  heading: string
  body: string
}

// The kit itself. `notes` is the field that becomes a rich Tiptap document
// later — everything else stays structured so PDF export and the future
// migration remain deterministic.
export type OnboardingContent = {
  welcome: string
  tools: OnboardingLink[]
  apps: OnboardingLink[]
  schedule: OnboardingSchedule
  checklist: ChecklistItem[]
  notes: NoteSection[]
}

export type Onboarding = {
  projectId: string
  content: OnboardingContent
  updatedAt: string
}

export function emptyOnboardingContent(): OnboardingContent {
  return {
    welcome: '',
    tools: [],
    apps: [],
    schedule: {
      days: [],
      coreStart: '',
      coreEnd: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    checklist: [],
    notes: [],
  }
}
