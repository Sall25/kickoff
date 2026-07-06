import { useTranslation } from 'react-i18next'
import { Avatar } from './Avatar'
import { useProjectMembers } from '../hooks/useRecruitment'

// Public roster of accepted contributors. Name + skills only — the members
// view never exposes email.
export function MembersBoard({ projectId }: { projectId: string }) {
  const { t } = useTranslation()
  const { data: members, isLoading } = useProjectMembers(projectId)

  if (isLoading || !members) return null

  return (
    <>
      <h2 className="ko-h3">{t('members.title')}</h2>
      {members.length === 0 ? (
        <p className="ko-note ko-mono">{t('members.empty')}</p>
      ) : (
        <ul className="ko-members">
          {members.map((member, index) => (
            <li key={`${member.name}-${index}`} className="ko-member">
              <Avatar name={member.name} size={34} />
              <div className="ko-member__body">
                <span className="ko-member__name">{member.name}</span>
                {member.skills.length > 0 && (
                  <span className="ko-member__skills ko-mono">
                    {member.skills.join(' · ')}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
