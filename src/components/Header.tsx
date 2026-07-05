import { Link } from '@tanstack/react-location'

export function Header() {
  return (
    <header className="ko-header">
      <div className="ko-shell ko-header__inner">
        <Link to="/" className="ko-logo">
          <span className="ko-logo__dot" aria-hidden="true" />
          KICKOFF
        </Link>
        <nav className="ko-nav" aria-label="Main">
          <Link to="/projects" className="ko-nav__link">
            Browse projects
          </Link>
          <Link to="/start" className="ko-btn ko-btn--primary ko-btn--sm">
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  )
}
