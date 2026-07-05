import { useState } from 'react'
import { useNavigate } from '@tanstack/react-location'
import { CATEGORIES, STAGES, type Category, type Stage } from '../api/types'
import { TagInput } from '../components/TagInput'
import { useCreateProject } from '../hooks/useProjects'

export function StartProject() {
  const navigate = useNavigate()
  const createProject = useCreateProject()

  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('web')
  const [stage, setStage] = useState<Stage>('idea')
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([])
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')

  const canSubmit =
    title.trim() &&
    pitch.trim() &&
    description.trim() &&
    ownerName.trim() &&
    ownerEmail.trim() &&
    !createProject.isPending

  function handleSubmit() {
    if (!canSubmit) return
    createProject.mutate(
      {
        title: title.trim(),
        pitch: pitch.trim(),
        description: description.trim(),
        category,
        stage,
        skillsNeeded,
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
      },
      {
        onSuccess: (created) => navigate({ to: `/projects/${created.id}` }),
      },
    )
  }

  return (
    <section className="ko-shell ko-page ko-page--narrow">
      <p className="ko-eyebrow ko-mono">DAY ZERO</p>
      <h1 className="ko-h1">Start a project</h1>
      <p className="ko-lede">
        Two minutes of honesty about what you're building and who you need. That's
        the whole pitch.
      </p>

      <div className="ko-card ko-form">
        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="p-title">
            Project title
          </label>
          <input
            id="p-title"
            className="ko-input"
            placeholder="Give it a name people will remember"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="p-pitch">
            One-line pitch
          </label>
          <input
            id="p-pitch"
            className="ko-input"
            placeholder="What it is, in one sentence"
            value={pitch}
            onChange={(event) => setPitch(event.target.value)}
          />
        </div>

        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="p-description">
            Description
          </label>
          <textarea
            id="p-description"
            className="ko-textarea ko-textarea--tall"
            placeholder="The problem, your plan, where it stands. Blank lines make paragraphs."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="ko-form__row">
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="p-category">
              Category
            </label>
            <select
              id="p-category"
              className="ko-select"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ko-field">
            <span className="ko-label ko-mono">Stage</span>
            <div className="ko-radio-group" role="radiogroup" aria-label="Stage">
              {STAGES.map((s) => (
                <label key={s.value} className="ko-radio" title={s.hint}>
                  <input
                    type="radio"
                    name="stage"
                    value={s.value}
                    checked={stage === s.value}
                    onChange={() => setStage(s.value)}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="p-skills">
            Skills you need
          </label>
          <TagInput
            id="p-skills"
            value={skillsNeeded}
            onChange={setSkillsNeeded}
            placeholder="react, design, marketing… press Enter after each"
          />
        </div>

        <div className="ko-form__row">
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="p-owner-name">
              Your name
            </label>
            <input
              id="p-owner-name"
              className="ko-input"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
            />
          </div>
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="p-owner-email">
              Email
            </label>
            <input
              id="p-owner-email"
              className="ko-input"
              type="email"
              placeholder="Where join requests land"
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
            />
          </div>
        </div>

        {createProject.isError && (
          <p className="ko-note ko-note--error ko-mono">
            Publish failed. Check that the API is running on port 3001, then try
            again.
          </p>
        )}

        <button
          type="button"
          className="ko-btn ko-btn--primary"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {createProject.isPending ? 'Publishing…' : 'Publish project'}
        </button>
      </div>
    </section>
  )
}
