import { useState } from 'react'
import { Link, useMatch } from '@tanstack/react-location'
import { StageBadge } from '../components/StageBadge'
import { TagInput } from '../components/TagInput'
import { useCreateJoinRequest, useJoinRequestCount } from '../hooks/useJoinRequests'
import { useProject } from '../hooks/useProjects'
import { timeAgo } from '../lib/format'

export function ProjectDetail() {
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
        <p className="ko-note ko-mono">Loading project…</p>
      </section>
    )
  }

  if (isError || !project) {
    return (
      <section className="ko-shell ko-page">
        <p className="ko-note ko-mono">
          That project isn't on the board. It may have been removed.
        </p>
        <Link to="/projects" className="ko-btn">
          Back to projects
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
          ← All projects
        </Link>
        <div className="ko-detail__top">
          <span className="ko-cat ko-mono">{project.category}</span>
          <StageBadge stage={project.stage} />
        </div>
        <h1 className="ko-h1">{project.title}</h1>
        <p className="ko-lede">{project.pitch}</p>

        <div className="ko-meta-list ko-mono">
          <span>Started by {project.ownerName}</span>
          <span>Posted {timeAgo(project.createdAt)}</span>
          <span>
            {joinCount === 0
              ? 'No join requests yet — be the first'
              : `${joinCount} ${joinCount === 1 ? 'person has' : 'people have'} asked to join`}
          </span>
        </div>

        <h2 className="ko-h3">About this project</h2>
        {project.description.split('\n\n').map((paragraph, index) => (
          <p key={index} className="ko-body">
            {paragraph}
          </p>
        ))}

        <h2 className="ko-h3">Skills needed</h2>
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
            <p className="ko-eyebrow ko-mono ko-success__eyebrow">REQUEST SENT</p>
            <h2 className="ko-h3">You're on {project.ownerName}'s radar.</h2>
            <p className="ko-body">
              They'll reply to <strong>{email}</strong> if it's a match. In the
              meantime, the board is full of other projects.
            </p>
            <Link to="/projects" className="ko-btn">
              Keep browsing
            </Link>
          </div>
        ) : (
          <div className="ko-card ko-form ko-form--side">
            <div>
              <p className="ko-eyebrow ko-mono">WANT IN?</p>
              <h2 className="ko-h3">Request to join</h2>
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-name">
                Your name
              </label>
              <input
                id="join-name"
                className="ko-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-email">
                Email
              </label>
              <input
                id="join-email"
                className="ko-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-skills">
                Your skills
              </label>
              <TagInput
                id="join-skills"
                value={skills}
                onChange={setSkills}
                placeholder="Type a skill, press Enter"
              />
            </div>
            <div className="ko-field">
              <label className="ko-label ko-mono" htmlFor="join-message">
                Why this project?
              </label>
              <textarea
                id="join-message"
                className="ko-textarea"
                placeholder="What you'd work on, what you bring…"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            {createJoinRequest.isError && (
              <p className="ko-note ko-note--error ko-mono">
                Request didn't go through. Check that the API is running, then try
                again.
              </p>
            )}
            <button
              type="button"
              className="ko-btn ko-btn--primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {createJoinRequest.isPending ? 'Sending…' : 'Send join request'}
            </button>
          </div>
        )}
      </aside>
    </section>
  )
}