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
          <Link to="/projects" className="ko-nav__link" aria-label={t('nav.browse')}>
            <span className="ko-nav__browse-text">{t('nav.browse')}</span>
            <span className="ko-nav__browse-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </span>
          </Link>
          <GitHubLink />
          <LanguageToggle />
          <ThemeToggle />

          <Link
            to="/start"
            className="tiptap-button ko-btn-link"
            data-style="primary"
            data-size="default"
            aria-label={t('common.startProject')}
          >
            <span className="ko-header__cta-full">{t('common.startProject')}</span>
            <span className="ko-header__cta-short" aria-hidden="true">+</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}