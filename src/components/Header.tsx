import { Link } from '@tanstack/react-location'
import { ThemeToggle } from './ThemeToggle'
import { GitHubLink } from './GithubLink'
import { LanguageToggle } from './LanguageToggle'

export function Header() {
  return (
    <header className="ko-header">
      <div className="ko-shell ko-header__inner">
        <Link to="/" className="ko-logo">
          <span className="ko-logo__dot" aria-hidden="true" />
          Kickoff
        </Link>
        <nav className="ko-nav" aria-label="Main">
          <Link to="/projects" className="ko-nav__link">
            Browse
          </Link>
          <GitHubLink />
          <LanguageToggle />
          <ThemeToggle />

          <Link
            to="/start"
            className="tiptap-button ko-btn-link"
            data-style="primary"
            data-size="default"
          >
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  )
}