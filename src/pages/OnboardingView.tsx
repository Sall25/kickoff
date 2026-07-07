import { Link, useMatch } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { OnboardingKitView } from '../components/OnboardingKitView'
import { SignInCard } from '../components/SignInCard'
import { useOnboardingMember } from '../hooks/useOnboarding'
import { useProject } from '../hooks/useProjects'
import { useSession } from '../hooks/useSession'

// Access is by membership, not a key: you can view a project's kit if you're
// signed in and you have an accepted request for it. Nothing to lose or leak.
export function OnboardingView() {
  const { t } = useTranslation()
  const {
    params: { projectId },
  } = useMatch()

  const { session, loading } = useSession()
  const email = session?.email ?? null
  const { data: project } = useProject(projectId)
  const { data, isLoading, error } = useOnboardingMember(projectId, email)

  if (loading) {
    return (
      <section className="ko-shell ko-page">
        <p className="ko-note ko-mono">{t('onboarding.loading')}</p>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="ko-shell ko-page ko-page--narrow">
        <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
          {t('onboarding.backToProject')}
        </Link>
        <SignInCard
          heading={t('onboarding.viewSignInHeading')}
          blurb={t('onboarding.viewSignInBlurb')}
        />
      </section>
    )
  }

  const notMember = error instanceof Error && error.message === 'not_member'

  if (notMember) {
    return (
      <section className="ko-shell ko-page ko-page--narrow">
        <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
          {t('onboarding.backToProject')}
        </Link>
        <div className="ko-card ko-form ko-obgate">
          <p className="ko-eyebrow ko-mono">{t('onboarding.eyebrow')}</p>
          <h1 className="ko-h2">{t('onboarding.notMemberTitle')}</h1>
          <p className="ko-body">{t('onboarding.notMemberBody')}</p>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="ko-shell ko-page">
        <p className="ko-note ko-mono">{t('onboarding.loading')}</p>
      </section>
    )
  }

  return (
    <section className="ko-shell ko-page ko-page--narrow ko-ob">
      <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
        {t('onboarding.backToProject')}
      </Link>

      {data && data.exists ? (
        <OnboardingKitView
          content={data.content}
          projectTitle={project?.title ?? ''}
          updatedAt={data.updatedAt}
        />
      ) : (
        <div className="ko-card ko-form ko-obgate">
          <p className="ko-eyebrow ko-mono">{t('onboarding.eyebrow')}</p>
          <h1 className="ko-h2">{t('onboarding.notPublishedTitle')}</h1>
          <p className="ko-body">{t('onboarding.notPublishedBody')}</p>
        </div>
      )}
    </section>
  )
}