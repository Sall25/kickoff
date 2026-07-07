import { useState } from 'react'
import { Link, useMatch } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { StatusBadge } from '../components/StatusBadge'
import { useOwnerInbox, useDecideRequest } from '../hooks/useRecruitment'
import { useProject } from '../hooks/useProjects'
import { timeAgo } from '../lib/format'
import { Button } from '../primitives/button'
import { Input } from '../primitives/input'

export function OwnerInbox() {
  const { t } = useTranslation()
  const {
    params: { projectId },
  } = useMatch()

  const { data: project } = useProject(projectId)
  const [emailInput, setEmailInput] = useState('')
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)

  const inbox = useOwnerInbox(projectId, ownerEmail)
  const decide = useDecideRequest(projectId, ownerEmail ?? '')

  function unlock() {
    const email = emailInput.trim()
    if (email) setOwnerEmail(email)
  }

  const gateError =
    inbox.error instanceof Error && inbox.error.message === 'owner_mismatch'

  if (!ownerEmail || gateError) {
    return (
      <section className="ko-shell ko-page ko-page--narrow">
        <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
          {t('onboarding.backToProject')}
        </Link>
        <div className="ko-card ko-form ko-obgate">
          <div>
            <p className="ko-eyebrow ko-mono">{t('requests.eyebrow')}</p>
            <h1 className="ko-h2">{t('requests.title')}</h1>
            {project && <p className="ko-lede">{project.title}</p>}
            <p className="ko-body">{t('requests.gateLede')}</p>
          </div>
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="req-owner-email">
              {t('onboarding.gateLabel')}
            </label>
            <Input
              id="req-owner-email"
              className="ko-input"
              type="email"
              placeholder={t('onboarding.gatePlaceholder')}
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && unlock()}
            />
            <p className="ko-note ko-mono">{t('onboarding.gateHint')}</p>
          </div>
          {gateError && (
            <p className="ko-note ko-note--error ko-mono">
              {t('onboarding.gateError')}
            </p>
          )}
          <Button
            type="button"
            disabled={!emailInput.trim()}
            onClick={unlock}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <span className="tiptap-button-text">
              {t('onboarding.gateUnlock')}
            </span>
          </Button>
        </div>
      </section>
    )
  }

  const requests = inbox.data ?? []

  return (
    <section className="ko-shell ko-page ko-page--narrow ko-ob">
      <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
        {t('onboarding.backToProject')}
      </Link>

      <p className="ko-eyebrow ko-mono">{t('requests.eyebrow')}</p>
      <h1 className="ko-h1">{t('requests.title')}</h1>
      {project && <p className="ko-lede">{project.title}</p>}
      <p className="ko-note ko-mono ko-req__consent">{t('requests.consent')}</p>

      {inbox.isLoading && (
        <p className="ko-note ko-mono">{t('requests.loading')}</p>
      )}

      {inbox.isSuccess && requests.length === 0 && (
        <p className="ko-note ko-mono">{t('requests.empty')}</p>
      )}

      <div className="ko-req__list">
        {requests.map((req) => (
          <article key={req.id} className="ko-card ko-req">
            <div className="ko-req__head">
              <div>
                <h2 className="ko-h3 ko-req__name">{req.name}</h2>
              </div>
              <StatusBadge status={req.status} />
            </div>

            {req.skills.length > 0 && (
              <div className="ko-chips">
                {req.skills.map((skill) => (
                  <span key={skill} className="ko-chip ko-mono">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <p className="ko-body ko-req__message">{req.message}</p>

            <div className="ko-req__foot">
              <span className="ko-note ko-mono">
                {t('requests.applied', { time: timeAgo(req.createdAt) })}
              </span>
              <div className="ko-req__actions">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={
                    req.status === 'rejected' ||
                    req.status === 'withdrawn' ||
                    decide.isPending
                  }
                  onClick={() =>
                    decide.mutate({ requestId: req.id, decision: 'rejected' })
                  }
                >
                  <span className="tiptap-button-text">
                    {t('requests.reject')}
                  </span>
                </Button>
                <Button
                  type="button"
                  disabled={
                    req.status === 'accepted' ||
                    req.status === 'withdrawn' ||
                    decide.isPending
                  }
                  onClick={() =>
                    decide.mutate({ requestId: req.id, decision: 'accepted' })
                  }
                >
                  <span className="tiptap-button-text">
                    {t('requests.accept')}
                  </span>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {decide.isError && (
        <p className="ko-note ko-note--error ko-mono">{t('requests.decideError')}</p>
      )}
    </section>
  )
}