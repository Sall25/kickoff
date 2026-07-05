import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-location'
import { CATEGORIES, STAGES } from '../api/types'
import { ProjectCard } from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'

export function Browse() {
  const { data: projects, isLoading, isError } = useProjects()
  const [category, setCategory] = useState('')
  const [stage, setStage] = useState('')
  const [skill, setSkill] = useState('')

  const filtered = useMemo(() => {
    let list = projects ?? []
    if (category) list = list.filter((p) => p.category === category)
    if (stage) list = list.filter((p) => p.stage === stage)
    if (skill.trim()) {
      const needle = skill.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.skillsNeeded.some((s) => s.toLowerCase().includes(needle)) ||
          p.title.toLowerCase().includes(needle) ||
          p.pitch.toLowerCase().includes(needle),
      )
    }
    return list
  }, [projects, category, stage, skill])

  const hasFilters = Boolean(category || stage || skill.trim())

  return (
    <section className="ko-shell ko-page">
      <div className="ko-section__head">
        <div>
          <p className="ko-eyebrow ko-mono">THE BOARD</p>
          <h1 className="ko-h1">Open projects</h1>
        </div>
        <Link to="/start" className="ko-btn ko-btn--primary">
          Start a project
        </Link>
      </div>

      <div className="ko-filters">
        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="filter-skill">
            Search
          </label>
          <input
            id="filter-skill"
            className="ko-input"
            placeholder="Skill, title, keyword…"
            value={skill}
            onChange={(event) => setSkill(event.target.value)}
          />
        </div>
        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="filter-category">
            Category
          </label>
          <select
            id="filter-category"
            className="ko-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="filter-stage">
            Stage
          </label>
          <select
            id="filter-stage"
            className="ko-select"
            value={stage}
            onChange={(event) => setStage(event.target.value)}
          >
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            type="button"
            className="ko-btn ko-btn--ghost ko-filters__clear"
            onClick={() => {
              setCategory('')
              setStage('')
              setSkill('')
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && <p className="ko-note ko-mono">Loading the board…</p>}
      {isError && (
        <p className="ko-note ko-mono">
          Couldn't reach the API. Is json-server running on port 3001?
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="ko-empty ko-card">
          {hasFilters ? (
            <>
              <p>No projects match those filters.</p>
              <button
                type="button"
                className="ko-btn"
                onClick={() => {
                  setCategory('')
                  setStage('')
                  setSkill('')
                }}
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p>The board is empty. First one on it gets the spotlight.</p>
              <Link to="/start" className="ko-btn ko-btn--primary">
                Start a project
              </Link>
            </>
          )}
        </div>
      )}

      <div className="ko-grid">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
