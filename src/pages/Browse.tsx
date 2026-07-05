import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-location'
import { CATEGORIES, STAGES } from '../api/types'
import { Input } from '../primitives/input'
import { ProjectCard } from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../primitives/dropdown-menu'
import { Button } from '../primitives/button'
import { Card, CardBody, CardGroupLabel, CardHeader } from '../primitives/card'
import { Spacer } from '../primitives/spacer'
import { ChevronDownIcon, ClearIcon } from '../icons'

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

  function clear() {
    setCategory('')
    setStage('')
    setSkill('')
  }

  return (
    <section className="ko-shell ko-page">
      <div className="ko-section__head">
        <div>
          <p className="ko-eyebrow">The board</p>
          <h1 className="ko-h1">Open projects</h1>
        </div>
        <Link
          to="/start"
          className="tiptap-button ko-btn-link"
          data-style="primary"
          data-size="default"
        >
          Start a project
        </Link>
      </div>

      <div className="ko-filters">
        <div className="ko-field ko-field--grow">
          <label className="ko-label" htmlFor="filter-skill">
            Search
          </label>
          <Input
            id="filter-skill"
            placeholder="Skill, title, keyword…"
            className="ko-input"
            value={skill}
            onChange={(event) => setSkill(event.target.value)}
          />
        </div>
        <div className="ko-field">
          <label className="ko-label" htmlFor="filter-category">
            Category
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className="ko-select">
                <span className='tiptap-button-text'>{category === '' ? 'All categories' : category}</span>
                <Spacer orientation='horizontal' />
                <ChevronDownIcon className='tiptap-button-icon-sub' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Card style={{ minWidth: 200, boxShadow: "var(--tt-shadow-elevated-sm)", padding: "5px 10px" }}>
                <CardHeader>
                  <CardGroupLabel>All categories</CardGroupLabel>
                </CardHeader>
                <CardBody style={{ width: "100%", justifyContent: "flex-start", alignItems: "flex-start" }}>
                  {CATEGORIES.map((c) => (
                    <DropdownMenuItem key={c.value} asChild>
                      <Button variant='ghost' onClick={() => setCategory(c.value)} style={{ width: "100%" }}>
                        <span className='tiptap-button-text'>{c.label}</span>
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </CardBody>
              </Card>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="ko-field">
          <label className="ko-label" htmlFor="filter-stage">
            Stage
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className="ko-select">
                <span className='tiptap-button-text'>{stage === '' ? 'All stages' : stage}</span>
                <Spacer orientation='horizontal' />
                <ChevronDownIcon className='tiptap-button-icon-sub' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Card style={{ minWidth: 200, boxShadow: "var(--tt-shadow-elevated-sm)", padding: "5px 10px" }}>
                <CardHeader>
                  <CardGroupLabel>All stages</CardGroupLabel>
                </CardHeader>
                <CardBody style={{ width: "100%", justifyContent: "flex-start", alignItems: "flex-start" }}>
                  {STAGES.map((s) => (
                    <DropdownMenuItem key={s.value} asChild>
                      <Button variant='ghost' onClick={() => setStage(s.value)} style={{ width: "100%" }}>
                        <span className='tiptap-button-text'>{s.label}</span>
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </CardBody>
              </Card>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {hasFilters && (
          <Button
            type="button"
            className="tiptap-button ko-filters__clear"
            data-style="ghost"
            onClick={clear}
          >
            <ClearIcon className="tiptap-button-icon" />
            <span className='tiptap-button-text'>Clear</span>
          </Button>
        )}
      </div>

      {isLoading && <p className="ko-note">Loading the board…</p>}
      {isError && (
        <p className="ko-note">
          Couldn't reach the API. Is the backend running?
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="ko-empty">
          {hasFilters ? (
            <>
              <p>No projects match those filters.</p>
              <button type="button" className="tiptap-button" onClick={clear}>
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p>The board is empty. First one on it gets the spotlight.</p>
              <Link
                to="/start"
                className="tiptap-button ko-btn-link"
                data-style="primary"
              >
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