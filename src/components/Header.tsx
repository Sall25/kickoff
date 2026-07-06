import { Link } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { useSession } from '../hooks/useSession'
import { ThemeToggle } from './ThemeToggle'
import { GitHubLink } from './GithubLink'
import { LanguageToggle } from './LanguageToggle'

export function Header() {
  const { t } = useTranslation()
  const { session } = useSession()

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

          {/* Only surfaces once a contributor has a session — browsing stays
              account-free. */}
          {session && (
            <Link to="/inbox" className="ko-nav__link" aria-label={t('nav.inbox')}>
              <span className="ko-nav__browse-text">{t('nav.inbox')}</span>
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
                  <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              </span>
            </Link>
          )}

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
