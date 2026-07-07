import { Link } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { Avatar } from './Avatar'
import { useProjectMembers } from '../hooks/useRecruitment'

const MAX_INLINE = 5

// Public roster of accepted contributors. Name + skills only — the members
// view never exposes email. Shows the first few; the rest live on the full
// grid page.
export function MembersBoard({ projectId }: { projectId: string }) {
  const { t } = useTranslation()
  const { data: members, isLoading } = useProjectMembers(projectId)

  if (isLoading || !members) return null

  const shown = members.slice(0, MAX_INLINE)
  const extra = members.length - shown.length

  return (
    <>
      <h2 className="ko-h3">{t('members.title')}</h2>
      {members.length === 0 ? (
        <p className="ko-note ko-mono">{t('members.empty')}</p>
      ) : (
        <>
          <ul className="ko-members">
            {shown.map((member, index) => (
              <li key={`${member.name}-${index}`} className="ko-member">
                <Avatar name={member.name} size={28} />
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
          {extra > 0 && (
            <Link
              to={`/projects/${projectId}/members`}
              className="ko-members__more ko-mono"
            >
              {t('members.more', { count: extra })}
            </Link>
          )}
        </>
      )}
    </>
  )
}