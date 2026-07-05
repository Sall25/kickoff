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