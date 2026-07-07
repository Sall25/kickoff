import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import type { MyRequest } from '../api/types'
import { SignInCard } from '../components/SignInCard'
import { StatusBadge } from '../components/StatusBadge'
import { useInboxSeen } from '../hooks/useInboxSeen'
import { useSession } from '../hooks/useSession'
import { useProjects } from '../hooks/useProjects'
import { useMyRequests, useWithdrawRequest } from '../hooks/useRecruitment'
import { timeAgo } from '../lib/format'
import { Button, ButtonGroup } from '../primitives/button'
import { Spacer } from '../primitives/spacer'

export function Inbox() {
  const { t } = useTranslation()
  const { session, loading, signOut } = useSession()
  const { seenAt, markSeen } = useInboxSeen()

  const email = session?.email ?? null
  const { data: requests, isLoading } = useMyRequests(email)
  const { data: projects } = useProjects()

  // Snapshot the pre-visit "seen" time ONCE, when the email first resolves,
  // so rows decided since the last visit stay flagged for this whole visit
  // even after we mark everything seen (which clears the header badge).
  const seenRef = useRef<number | null>(null)
  if (email && seenRef.current === null) seenRef.current = seenAt(email)
  const seenOnEntry = seenRef.current ?? 0

  useEffect(() => {
    if (email && requests) markSeen(email)
  }, [email, requests, markSeen])

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
            seenOnEntry={seenOnEntry}
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
  seenOnEntry,
}: {
  req: MyRequest
  title: string
  email: string
  seenOnEntry: number
}) {
  const { t } = useTranslation()
  const accepted = req.status === 'accepted'
  const pending = req.status === 'pending'
  const decided = accepted || req.status === 'rejected'
  const isNew =
    decided && req.decidedAt !== null && Date.parse(req.decidedAt) > seenOnEntry
  const withdraw = useWithdrawRequest(email)

  return (
    <article className="ko-card ko-req" data-new={isNew || undefined}>
      <div className="ko-req__head">
        <ButtonGroup orientation='horizontal'>
          <Link to={`/projects/${req.projectId}`} className="ko-h3 ko-req__name">
            {title}
          </Link>
          <Spacer orientation='horizontal' size={5} />
          <span className="ko-note ko-mono">
            {t('inbox.applied', { time: timeAgo(req.createdAt) })}
          </span>
        </ButtonGroup>
        <div className="ko-req__badges">
          {isNew && <span className="ko-req__new ko-mono">{t('inbox.new')}</span>}
          <StatusBadge status={req.status} />
        </div>
      </div>

      {accepted && (
        <div className="ko-req__kit">
          <Link
            to={`/projects/${req.projectId}/onboarding`}
            className="ko-btn-link ko-mono"
          >
            {t('inbox.viewKit')}
          </Link>
        </div>
      )}

      {pending && (
        <div className="ko-req__foot">
          <span className="ko-note ko-mono">{t('inbox.pendingHint')}</span>
          <Button
            type="button"
            variant="ghost"
            disabled={withdraw.isPending}
            onClick={() => withdraw.mutate(req.id)}
          >
            <span className="tiptap-button-text">{t('inbox.withdraw')}</span>
          </Button>
        </div>
      )}
    </article>
  )
}