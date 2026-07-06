import { Link } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import type { MyRequest } from '../api/types'
import { SignInCard } from '../components/SignInCard'
import { StatusBadge } from '../components/StatusBadge'
import { useSession } from '../hooks/useSession'
import { useProjects } from '../hooks/useProjects'
import { useMyOnboardingKey, useMyRequests } from '../hooks/useRecruitment'
import { timeAgo } from '../lib/format'
import { Button } from '../primitives/button'

export function Inbox() {
  const { t } = useTranslation()
  const { session, loading, signOut } = useSession()

  const email = session?.email ?? null
  const { data: requests, isLoading } = useMyRequests(email)
  const { data: projects } = useProjects()

  if (loading) {
    return (
      <section className="ko-shell ko-page">
        <p className="ko-note ko-mono">{t('inbox.loading')}</p>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="ko-shell ko-page ko-page--narrow">
        <SignInCard
          heading={t('inbox.signInHeading')}
          blurb={t('inbox.signInBlurb')}
        />
      </section>
    )
  }

  const titleFor = (projectId: string) =>
    projects?.find((p) => p.id === projectId)?.title ?? projectId

  const rows = requests ?? []

  return (
    <section className="ko-shell ko-page ko-page--narrow ko-ob">
      <div className="ko-inbox__head">
        <div>
          <p className="ko-eyebrow ko-mono">{t('inbox.eyebrow')}</p>
          <h1 className="ko-h1">{t('inbox.title')}</h1>
          <p className="ko-note ko-mono">
            {t('inbox.signedInAs', { email: session.email })}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={() => void signOut()}>
          <span className="tiptap-button-text">{t('inbox.signOut')}</span>
        </Button>
      </div>

      {isLoading && <p className="ko-note ko-mono">{t('inbox.loading')}</p>}

      {!isLoading && rows.length === 0 && (
        <div className="ko-empty">
          <p className="ko-body">{t('inbox.empty')}</p>
          <Link to="/projects" className="ko-btn-link ko-mono">
            {t('inbox.browse')}
          </Link>
        </div>
      )}

      <div className="ko-req__list">
        {rows.map((req) => (
          <InboxRow
            key={req.id}
            req={req}
            title={titleFor(req.projectId)}
            email={session.email}
          />
        ))}
      </div>
    </section>
  )
}

function InboxRow({
  req,
  title,
  email,
}: {
  req: MyRequest
  title: string
  email: string
}) {
  const { t } = useTranslation()
  const accepted = req.status === 'accepted'
  const { data: keyData } = useMyOnboardingKey(req.projectId, email, accepted)

  return (
    <article className="ko-card ko-req">
      <div className="ko-req__head">
        <div>
          <Link to={`/projects/${req.projectId}`} className="ko-h3 ko-req__name">
            {title}
          </Link>
          <span className="ko-note ko-mono">
            {t('inbox.applied', { time: timeAgo(req.createdAt) })}
          </span>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {accepted && (
        <div className="ko-req__kit">
          {keyData?.shareKey ? (
            <Link
              to={`/projects/${req.projectId}/onboarding`}
              search={{ k: keyData.shareKey }}
              className="ko-btn-link ko-mono"
            >
              {t('inbox.viewKit')}
            </Link>
          ) : (
            <span className="ko-note ko-mono">{t('inbox.kitPending')}</span>
          )}
        </div>
      )}
    </article>
  )
}
