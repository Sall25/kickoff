import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSession } from '../hooks/useSession'
import { Button } from '../primitives/button'
import { Input } from '../primitives/input'

// Contextual sign-in — rendered wherever a contributor first needs identity
// (the inbox route, or ahead of sending a join request). Not a global gate;
// browsing stays account-free.
export function SignInCard({ heading, blurb }: { heading?: string; blurb?: string }) {
  const { t } = useTranslation()
  const { signIn } = useSession()

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  async function submit() {
    const clean = email.trim()
    if (!clean || pending) return
    setPending(true)
    setError(false)
    try {
      // The magic link returns the user to the exact page they signed in
      // from — a contributor gated at a kit lands back on that kit.
      const { sent: linkSent } = await signIn(clean)
      if (linkSent) setSent(true)
      // dev stub signs in immediately; the session flips and the parent
      // re-renders past this card.
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <div className="ko-card ko-form ko-signin">
        <div>
          <p className="ko-eyebrow ko-mono">{t('auth.checkEmailEyebrow')}</p>
          <h2 className="ko-h3">{t('auth.checkEmailTitle')}</h2>
          <p className="ko-body">{t('auth.checkEmailBody', { email: email.trim() })}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ko-card ko-form ko-signin">
      <div>
        <p className="ko-eyebrow ko-mono">{t('auth.eyebrow')}</p>
        <h2 className="ko-h3">{heading ?? t('auth.title')}</h2>
        <p className="ko-body">{blurb ?? t('auth.blurb')}</p>
      </div>
      <div className="ko-field">
        <label className="ko-label ko-mono" htmlFor="signin-email">
          {t('common.email')}
        </label>
        <Input
          id="signin-email"
          className="ko-input"
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submit()}
        />
      </div>
      {error && (
        <p className="ko-note ko-note--error ko-mono">{t('auth.error')}</p>
      )}
      <Button
        type="button"
        disabled={!email.trim() || pending}
        onClick={submit}
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <span className="tiptap-button-text">
          {pending ? t('auth.sending') : t('auth.continue')}
        </span>
      </Button>
    </div>
  )
}