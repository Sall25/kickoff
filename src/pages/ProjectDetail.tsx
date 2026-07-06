import { useState } from 'react'
import { Link, useMatch } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { StageBadge } from '../components/StageBadge'
import { TagInput } from '../components/TagInput'
import { useCreateJoinRequest, useJoinRequestCount } from '../hooks/useJoinRequests'
import { useProject } from '../hooks/useProjects'
import { timeAgo } from '../lib/format'
import { Badge } from '../primitives/badge'
import { Spacer } from '../primitives/spacer'
import { Button, ButtonGroup } from '../primitives/button'
import { Input } from '../primitives/input'
import { TextareaAutosize } from '../primitives/textarea-autosize'

export function ProjectDetail() {
  const { t } = useTranslation()
  const {
    params: { projectId },
  } = useMatch()

  const { data: project, isLoading, isError } = useProject(projectId)
  const { data: joinRequestCount } = useJoinRequestCount(projectId)
  const createJoinRequest = useCreateJoinRequest(projectId)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (isLoading) {
    return (
      <section className="ko-shell ko-page">
        <p className="ko-note ko-mono">{t('detail.loading')}</p>
      </section>
    )
  }

  if (isError || !project) {
    return (
      <section className="ko-shell ko-page">
        <p className="ko-note ko-mono">{t('detail.notFound')}</p>
        <Link to="/projects" className="ko-btn">
          {t('detail.backToProjects')}
        </Link>
      </section>
    )
  }

  const joinCount = joinRequestCount ?? 0
  const canSubmit =
    name.trim() && email.trim() && message.trim() && !createJoinRequest.isPending

  function handleSubmit() {
    if (!canSubmit) return
    createJoinRequest.mutate(
      {
        projectId,
        name: name.trim(),
        email: email.trim(),
        skills,
        message: message.trim(),
      },
      { onSuccess: () => setSubmitted(true) },
    )
  }

  return (
    <section className="ko-shell ko-page ko-detail">
      <article className="ko-detail__main">
        <Link to="/projects" className="ko-back ko-mono">
          {t('detail.allProjects')}
        </Link>
        <div className="ko-detail__top">
          <span className="ko-cat ko-mono">
            {t(`category.${project.category}`, { defaultValue: project.category })}
          </span>
          <StageBadge stage={project.stage} />
        </div>
        <h1 className="ko-h1">{project.title}</h1>
        <p className="ko-lede">{project.pitch}</p>

        <div className="ko-meta-list ko-mono">
          <ButtonGroup orientation='horizontal'>
            <span>{t('detail.startedBy', { name: project.ownerName })}</span>
            <Spacer orientation="horizontal" size={5} />
            <Badge variant='green' style={{ maxWidth: 100 }}>
              <span>{t('detail.posted', { time: timeAgo(project.createdAt) })}</span>
            </Badge>
          </ButtonGroup>
          <br />
          <span style={{ color: "var(--ko-text-secondary)" }}>
            {joinCount === 0
              ? t('detail.noJoinYet')
              : t('detail.joinCount', { count: joinCount })}
          </span>
          <br />
          <Link
            to={`/projects/${projectId}/onboarding`}
            className="ko-detail__oblink"
          >
            {t('detail.onboardingLink')}
          </Link>
        </div>

        <h2 className="ko-h3">{t('detail.about')}</h2>
        {project.description.split('\n\n').map((paragraph, index) => (
          <p key={index} className="ko-body">
            {paragraph}
          </p>
        ))}

        <h2 className="ko-h3">{t('detail.skillsNeeded')}</h2>
        <div className="ko-chips">
          {project.skillsNeeded.map((skill) => (
            <span key={skill} className="ko-chip ko-chip--lg ko-mono">
              {skill}
            </span>
          ))}
        </div>
      </article>

      <aside className="ko-detail__side">
        {submitted ? (
          <div className="ko-card ko-success">
            <p className="ko-eyebrow ko-mono ko-success__eyebrow">{t('detail.requestSent')}</p>
            <h2 className="ko-h3">{t('detail.onRadar', { name: project.ownerName })}</h2>
            <p className="ko-body">
              {t('detail.successBodyPre')}<strong>{email}</strong>{t('detail.successBodyPost')}
            </p>
            <Link to="/projects" className="ko-btn">
              {t('detail.keepBrowsing')}
            </Link>
          </div>
        ) : (
          <div className="ko-card ko-form ko-form--side">
            <div>
              <p className="ko-eyebrow ko-mono">{t('detail.wantIn')}</p>
              <h2 className="ko-h3">{t('detail.requestToJoin')}</h2>
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-name">
                {t('common.yourName')}
              </label>
              <Input
                id="join-name"
                className="ko-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-email">
                {t('common.email')}
              </label>
              <Input
                id="join-email"
                className="ko-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-skills">
                {t('detail.yourSkills')}
              </label>
              <TagInput
                id="join-skills"
                value={skills}
                onChange={setSkills}
                placeholder={t('detail.skillsPlaceholder')}
              />
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-message">
                {t('detail.whyProject')}
              </label>
              <TextareaAutosize
                id="join-message"
                className="ko-textarea"
                minRows={4}
                placeholder={t('detail.messagePlaceholder')}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            {createJoinRequest.isError && (
              <p className="ko-note ko-note--error ko-mono">{t('detail.requestError')}</p>
            )}
            <Button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <span className="tiptap-button-text"> {createJoinRequest.isPending ? t('detail.sending') : t('detail.sendRequest')}</span>
            </Button>
          </div>
        )}
        <p className="ko-note ko-mono ko-detail__ownercta">
          <Link to={`/projects/${projectId}/onboarding/edit`}>
            {t('detail.ownerCta')}
          </Link>
        </p>
      </aside>
    </section>
  )
}