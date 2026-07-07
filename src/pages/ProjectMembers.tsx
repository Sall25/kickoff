import { Link, useMatch } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../components/Avatar'
import { useProject } from '../hooks/useProjects'
import { useProjectMembers } from '../hooks/useRecruitment'

export function ProjectMembers() {
  const { t } = useTranslation()
  const {
    params: { projectId },
  } = useMatch()

  const { data: project } = useProject(projectId)
  const { data: members, isLoading } = useProjectMembers(projectId)

  return (
    <section className="ko-shell ko-page ko-page--narrow">
      <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
        {t('onboarding.backToProject')}
      </Link>

      <p className="ko-eyebrow ko-mono">{t('members.eyebrow')}</p>
      <h1 className="ko-h1">{t('members.title')}</h1>
      {project && <p className="ko-lede">{project.title}</p>}

      {isLoading && <p className="ko-note ko-mono">{t('members.loading')}</p>}

      {members && members.length === 0 && (
        <p className="ko-note ko-mono">{t('members.empty')}</p>
      )}

      {members && members.length > 0 && (
        <ul className="ko-members-grid">
          {members.map((member, index) => (
            <li key={`${member.name}-${index}`} className="ko-membercard">
              <Avatar name={member.name} size={40} />
              <span className="ko-membercard__name">{member.name}</span>
              {member.skills.length > 0 && (
                <div className="ko-chips">
                  {member.skills.map((skill) => (
                    <span key={skill} className="ko-chip ko-mono">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}