import { Link } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from './ThemeToggle'
import { GitHubLink } from './GithubLink'
import { LanguageToggle } from './LanguageToggle'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="ko-header">
      <div className="ko-shell ko-header__inner">
        <Link to="/" className="ko-logo">
          <span className="ko-logo__dot" aria-hidden="true" />
          Kickoff
        </Link>
        <nav className="ko-nav" aria-label={t('nav.mainLabel')}>
          <Link to="/projects" className="ko-nav__link">
            {t('nav.browse')}
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
            {t('common.startProject')}
          </Link>
        </nav>
      </div>
    </header>
  )
}