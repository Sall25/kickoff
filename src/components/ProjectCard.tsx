import { Link } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { Board, BoardContent, BoardCover } from '../primitives/board'
import type { Project } from '../api/types'
import { timeAgo } from '../lib/format'
import { Avatar } from './Avatar'
import { StageBadge } from './StageBadge'

const COVER_TINT: Record<string, string> = {
  web: 'var(--ko-avatar-2-bg)',
  mobile: 'var(--ko-avatar-1-bg)',
  hardware: 'var(--ko-avatar-4-bg)',
  games: 'var(--ko-avatar-5-bg)',
  community: 'var(--ko-avatar-3-bg)',
  data: 'var(--ko-avatar-6-bg)',
}

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useTranslation()
  const extra = project.skillsNeeded.length - 3
  return (
    <Link to={`/projects/${project.id}`} className="ko-pcard-link">
      <Board className="ko-pcard">
        <BoardCover
          height={6}
          style={{ background: COVER_TINT[project.category] ?? 'var(--ko-primary)' }}
        />
        <BoardContent className="ko-pcard__body">
          <div className="ko-pcard__top">
            <span className="ko-cat">
              {t(`category.${project.category}`, { defaultValue: project.category })}
            </span>
            <StageBadge stage={project.stage} />
          </div>
          <h3 className="ko-pcard__title">{project.title}</h3>
          <p className="ko-pcard__pitch">{project.pitch}</p>
          <div className="ko-chips">
            {project.skillsNeeded.slice(0, 3).map((skill) => (
              <span key={skill} className="ko-chip">
                {skill}
              </span>
            ))}
            {extra > 0 && <span className="ko-chip ko-chip--more">+{extra}</span>}
          </div>
          <div className="ko-pcard__foot">
            <span className="ko-pcard__owner">
              <Avatar name={project.ownerName} size={24} />
              {project.ownerName}
            </span>
            <span className="ko-pcard__time">{timeAgo(project.createdAt)}</span>
          </div>
        </BoardContent>
      </Board>
    </Link>
  )
}