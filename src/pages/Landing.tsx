import { Link } from '@tanstack/react-location'
import { ProjectCard } from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'
import { timeAgo } from '../lib/format'

export function Landing() {
  const { data: projects } = useProjects()
  const latest = (projects ?? []).slice(0, 3)
  const featured = (projects ?? []).slice(0, 6)

  return (
    <>
      <section className="ko-shell ko-hero">
        <div className="ko-hero__copy">
          <p className="ko-eyebrow ko-mono">PROJECTS, DAY ZERO</p>
          <h1 className="ko-hero__title">
            Every good idea deserves a <span className="ko-hero__mark">kickoff.</span>
          </h1>
          <p className="ko-hero__sub">
            Post the project you can't stop thinking about, or lend your skills to one
            that's already rolling. No pitch decks, no gatekeepers — just people who
            build.
          </p>
          <div className="ko-hero__ctas">
            <Link to="/start" className="ko-btn ko-btn--primary">
              Start a project
            </Link>
            <Link to="/projects" className="ko-btn">
              Find one to join
            </Link>
          </div>
        </div>

        <aside className="ko-board ko-card" aria-label="Latest projects">
          <div className="ko-board__head ko-mono">
            <span>LATEST ON THE BOARD</span>
            <span className="ko-live">
              <span className="ko-live__dot" aria-hidden="true" />
              LIVE
            </span>
          </div>
          <div className="ko-board__list">
            {latest.length === 0 && (
              <p className="ko-board__empty">
                Nothing here yet. Be the first on the board.
              </p>
            )}
            {latest.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="ko-board__item"
              >
                <strong>{project.title}</strong>
                <span className="ko-board__pitch">{project.pitch}</span>
                <span className="ko-board__time ko-mono">
                  {timeAgo(project.createdAt)} · {project.category}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="ko-shell ko-section ko-startline">
        <div className="ko-section__head">
          <h2 className="ko-h2">How it works</h2>
          <p className="ko-eyebrow ko-mono">TWO WAYS IN</p>
        </div>
        <div className="ko-lanes">
          <div className="ko-lane ko-card">
            <p className="ko-lane__title ko-mono">STARTING SOMETHING</p>
            <ol className="ko-steps">
              <li className="ko-step">
                <span className="ko-step__num ko-mono">1</span>
                <div>
                  <strong>Post your project</strong>
                  <span>A title, a one-line pitch, and the skills you're missing.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num ko-mono">2</span>
                <div>
                  <strong>Get join requests</strong>
                  <span>People who want in tell you what they bring.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num ko-mono">3</span>
                <div>
                  <strong>Pick your team</strong>
                  <span>Reply to the ones who fit, and start building.</span>
                </div>
              </li>
            </ol>
          </div>
          <div className="ko-lane ko-card">
            <p className="ko-lane__title ko-mono">JOINING ONE</p>
            <ol className="ko-steps">
              <li className="ko-step">
                <span className="ko-step__num ko-mono">1</span>
                <div>
                  <strong>Browse open projects</strong>
                  <span>Filter by category, stage, or the skills they need.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num ko-mono">2</span>
                <div>
                  <strong>Send a join request</strong>
                  <span>Say what you can do and why this one caught your eye.</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num ko-mono">3</span>
                <div>
                  <strong>Hear back, get to work</strong>
                  <span>The project owner replies straight to your inbox.</span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="ko-shell ko-section ko-startline">
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
          <div className="ko-hero__ctas ko-band__ctas">
            <Link to="/start" className="ko-btn ko-btn--inverse">
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
