import { Link } from '@tanstack/react-location'
import { ProjectCard } from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'
import { timeAgo } from '../lib/format'

function isThisWeek(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000
}

export function Landing() {
  const { data: projects } = useProjects()
  const all = projects ?? []
  const latest = all.slice(0, 3)
  const featured = all.slice(0, 6)

  const newThisWeek = all.filter((p) => isThisWeek(p.createdAt)).length
  const launching = all.filter((p) => p.stage === 'launching').length

  return (
    <>
      <section className="ko-shell ko-hero">
        <div className="ko-hero__copy">
          <p className="ko-eyebrow">A home for half-built ideas</p>
          <h1 className="ko-hero__title">
            Find your people.
            <br />
            Build the <span className="ko-hero__mark">thing.</span>
          </h1>
          <p className="ko-hero__sub">
            Post the project you can't stop thinking about, or lend your skills to
            one that's already moving. No pitch decks, no gatekeepers — just people
            who build.
          </p>
          <div className="ko-hero__ctas">
            <Link
              to="/start"
              className="tiptap-button ko-btn-link"
              data-style="primary"
              data-size="large"
            >
              Start a project
            </Link>
            <Link
              to="/projects"
              className="tiptap-button ko-btn-link"
              data-size="large"
            >
              Find a project
            </Link>
          </div>

          <div className="ko-activity" aria-label="Activity">
            <span className="ko-activity__item">
              <span className="ko-activity__dot" aria-hidden="true" />
              {newThisWeek} new this week
            </span>
            <span className="ko-activity__item">
              <span className="ko-activity__dot" aria-hidden="true" />
              {all.length} on the board
            </span>
            <span className="ko-activity__item">
              <span className="ko-activity__dot" aria-hidden="true" />
              {launching} launching
            </span>
          </div>
        </div>

        <aside className="ko-liveboard" aria-label="Latest projects">
          <div className="ko-liveboard__head">
            <span>Latest on the board</span>
            <span className="ko-live">
              <span className="ko-live__dot" aria-hidden="true" />
              live
            </span>
          </div>
          <div className="ko-liveboard__list">
            {latest.length === 0 && (
              <p className="ko-liveboard__empty">
                Nothing here yet. Be the first on the board.
              </p>
            )}
            {latest.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="ko-liveboard__item"
              >
                <strong>{project.title}</strong>
                <span className="ko-liveboard__pitch">{project.pitch}</span>
                <span className="ko-liveboard__time">
                  {timeAgo(project.createdAt)} · {project.category}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="ko-shell ko-section">
        <div className="ko-section__head">
          <h2 className="ko-h2">How it works</h2>
          <p className="ko-eyebrow">Two ways in</p>
        </div>
        <div className="ko-lanes">
          <div className="ko-lane">
            <p className="ko-lane__title">Starting something</p>
            <ol className="ko-steps">
              <li className="ko-step">
                <span className="ko-step__num">1</span>
                <div>
                  <strong>Post your project</strong>
                  <span>A title, a one-line pitch, and the skills you're missing.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">2</span>
                <div>
                  <strong>Get join requests</strong>
                  <span>People who want in tell you what they bring.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">3</span>
                <div>
                  <strong>Pick your team</strong>
                  <span>Reply to the ones who fit, and start building.</span>
                </div>
              </li>
            </ol>
          </div>
          <div className="ko-lane">
            <p className="ko-lane__title">Joining one</p>
            <ol className="ko-steps">
              <li className="ko-step">
                <span className="ko-step__num">1</span>
                <div>
                  <strong>Browse open projects</strong>
                  <span>Filter by category, stage, or the skills they need.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">2</span>
                <div>
                  <strong>Send a join request</strong>
                  <span>Say what you can do and why this one caught your eye.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">3</span>
                <div>
                  <strong>Hear back, get to work</strong>
                  <span>The project owner replies straight to your inbox.</span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="ko-shell ko-section">
        <div className="ko-section__head">
          <h2 className="ko-h2">Open projects</h2>
          <Link to="/projects" className="ko-nav__link">
            See all →
          </Link>
        </div>
        <div className="ko-grid">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="ko-shell ko-section">
        <div className="ko-band">
          <h2 className="ko-band__title">The starting line is open.</h2>
          <p className="ko-band__sub">
            It takes two minutes to post a project, and less to ask to join one.
          </p>
          <Link
            to="/start"
            className="tiptap-button ko-btn-link ko-band__cta"
            data-size="large"
          >
            Start a project
          </Link>
        </div>
      </section>
    </>
  )
}