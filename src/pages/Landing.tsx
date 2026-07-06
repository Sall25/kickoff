import { Link } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { ProjectCard } from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'
import { timeAgo } from '../lib/format'

function isThisWeek(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000
}

export function Landing() {
  const { t } = useTranslation()
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
          <p className="ko-eyebrow">{t('landing.eyebrow')}</p>
          <h1 className="ko-hero__title">
            {t('landing.heroTitleLine1')}
            <br />
            {t('landing.heroTitleLine2Pre')}
            <span className="ko-hero__mark">{t('landing.heroTitleMark')}</span>
          </h1>
          <p className="ko-hero__sub">{t('landing.heroSub')}</p>
          <div className="ko-hero__ctas">
            <Link
              to="/start"
              className="tiptap-button ko-btn-link"
              data-style="primary"
              data-size="large"
            >
              {t('common.startProject')}
            </Link>
            <Link
              to="/projects"
              className="tiptap-button ko-btn-link"
              data-size="large"
            >
              {t('common.findProject')}
            </Link>
          </div>

          <div className="ko-activity" aria-label={t('landing.activity')}>
            <span className="ko-activity__item">
              <span className="ko-activity__dot" aria-hidden="true" />
              {t('landing.newThisWeek', { count: newThisWeek })}
            </span>
            <span className="ko-activity__item">
              <span className="ko-activity__dot" aria-hidden="true" />
              {t('landing.boardCount', { count: all.length })}
            </span>
            <span className="ko-activity__item">
              <span className="ko-activity__dot" aria-hidden="true" />
              {t('landing.launchingCount', { count: launching })}
            </span>
          </div>
        </div>

        <aside className="ko-liveboard" aria-label={t('landing.liveboardLabel')}>
          <div className="ko-liveboard__head">
            <span>{t('landing.liveboardHead')}</span>
            <span className="ko-live">
              <span className="ko-live__dot" aria-hidden="true" />
              {t('landing.live')}
            </span>
          </div>
          <div className="ko-liveboard__list">
            {latest.length === 0 && (
              <p className="ko-liveboard__empty">{t('landing.liveboardEmpty')}</p>
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
                  {timeAgo(project.createdAt)} ·{' '}
                  {t(`category.${project.category}`, { defaultValue: project.category })}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="ko-shell ko-section">
        <div className="ko-section__head">
          <h2 className="ko-h2">{t('landing.howItWorks')}</h2>
          <p className="ko-eyebrow">{t('landing.twoWaysIn')}</p>
        </div>
        <div className="ko-lanes">
          <div className="ko-lane">
            <p className="ko-lane__title">{t('landing.laneStartTitle')}</p>
            <ol className="ko-steps">
              <li className="ko-step">
                <span className="ko-step__num">1</span>
                <div>
                  <strong>{t('landing.startStep1Title')}</strong>
                  <span>{t('landing.startStep1Body')}</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">2</span>
                <div>
                  <strong>{t('landing.startStep2Title')}</strong>
                  <span>{t('landing.startStep2Body')}</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">3</span>
                <div>
                  <strong>{t('landing.startStep3Title')}</strong>
                  <span>{t('landing.startStep3Body')}</span>
                </div>
              </li>
            </ol>
          </div>
          <div className="ko-lane">
            <p className="ko-lane__title">{t('landing.laneJoinTitle')}</p>
            <ol className="ko-steps">
              <li className="ko-step">
                <span className="ko-step__num">1</span>
                <div>
                  <strong>{t('landing.joinStep1Title')}</strong>
                  <span>{t('landing.joinStep1Body')}</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">2</span>
                <div>
                  <strong>{t('landing.joinStep2Title')}</strong>
                  <span>{t('landing.joinStep2Body')}</span>
                </div>
              </li>
              <li className="ko-step">
                <span className="ko-step__num">3</span>
                <div>
                  <strong>{t('landing.joinStep3Title')}</strong>
                  <span>{t('landing.joinStep3Body')}</span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="ko-shell ko-section">
        <div className="ko-section__head">
          <h2 className="ko-h2">{t('landing.openProjects')}</h2>
          <Link to="/projects" className="ko-nav__link">
            {t('landing.seeAll')}
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
          <h2 className="ko-band__title">{t('landing.bandTitle')}</h2>
          <p className="ko-band__sub">{t('landing.bandSub')}</p>
          <Link
            to="/start"
            className="tiptap-button ko-btn-link ko-band__cta"
            data-size="large"
          >
            {t('common.startProject')}
          </Link>
        </div>
      </section>
    </>
  )
}