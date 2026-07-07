import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

// Tracks when a contributor last opened their inbox, per email. An unseen
// "decision" is any of their requests decided after this timestamp — so the
// notification is derived from data we already have, not a separate table
// that needs a trigger to stay in sync. Per-device (localStorage), which is
// fine at this scale.

const key = (email: string) => `ko-inbox-seen:${email.toLowerCase()}`

type InboxSeenValue = {
  seenAt: (email: string) => number
  markSeen: (email: string) => void
}

const InboxSeenContext = createContext<InboxSeenValue | null>(null)

export function InboxSeenProvider({ children }: { children: ReactNode }) {
  // Bumped on markSeen so consumers (the header badge) recompute.
  const [, bump] = useState(0)

  const seenAt = useCallback((email: string): number => {
    const raw = localStorage.getItem(key(email))
    return raw ? Date.parse(raw) : 0
  }, [])

  const markSeen = useCallback((email: string) => {
    localStorage.setItem(key(email), new Date().toISOString())
    bump((n) => n + 1)
  }, [])

  return (
    <InboxSeenContext.Provider value={{ seenAt, markSeen }}>
      {children}
    </InboxSeenContext.Provider>
  )
}

export function useInboxSeen(): InboxSeenValue {
  const ctx = useContext(InboxSeenContext)
  if (!ctx) {
    throw new Error('useInboxSeen must be used within InboxSeenProvider')
  }
  return ctx
}