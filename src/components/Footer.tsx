import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="ko-footer">
      <div className="ko-shell ko-footer__inner">
        <span className="ko-footer__brand">
          <span className="ko-logo__dot" aria-hidden="true" />
          Kickoff
        </span>
        <span className="ko-footer__tag">{t('footer.tagline')}</span>
      </div>
    </footer>
  )
}