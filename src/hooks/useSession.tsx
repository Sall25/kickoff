import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, useSupabase } from '../api/supabase'

// Contributor identity is just an email — that's what RLS keys on
// (auth.email()) and all the UI needs to show. Owners never reach this:
// they act via ownerEmail-as-capability, no account.

const DEV_KEY = 'ko-contributor-email'

export type Session = { email: string } | null

type SessionContextValue = {
  session: Session
  loading: boolean
  // Returns { sent: true } when a magic link was emailed (prod) and the
  // caller should show "check your inbox"; { sent: false } when the session
  // is already live (dev stub).
  signIn: (email: string) => Promise<{ sent: boolean }>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (useSupabase && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(
          data.session ? { email: data.session.user.email ?? '' } : null,
        )
        setLoading(false)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s ? { email: s.user.email ?? '' } : null)
      })
      return () => sub.subscription.unsubscribe()
    }

    // dev stub: no real auth, just a remembered email
    const stored = localStorage.getItem(DEV_KEY)
    setSession(stored ? { email: stored } : null)
    setLoading(false)
  }, [])

  async function signIn(email: string): Promise<{ sent: boolean }> {
    const clean = email.trim()
    if (!clean) return { sent: false }

    if (useSupabase && supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: { emailRedirectTo: window.location.href },
      })
      if (error) throw new Error(error.message)
      return { sent: true } // session arrives when they click the link
    }

    localStorage.setItem(DEV_KEY, clean)
    setSession({ email: clean })
    return { sent: false } // signed in immediately
  }

  async function signOut(): Promise<void> {
    if (useSupabase && supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(DEV_KEY)
      setSession(null)
    }
  }

  return (
    <SessionContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
