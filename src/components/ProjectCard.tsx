import { Link } from '@tanstack/react-location'
import type { Project } from '../api/types'
import { timeAgo } from '../lib/format'
import { StageBadge } from './StageBadge'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="ko-pcard">
      <div className="ko-pcard__top">
        <span className="ko-cat ko-mono">{project.category}</span>
        <StageBadge stage={project.stage} />
      </div>
      <h3 className="ko-pcard__title">{project.title}</h3>
      <p className="ko-pcard__pitch">{project.pitch}</p>
      <div className="ko-chips">
        {project.skillsNeeded.slice(0, 4).map((skill) => (
          <span key={skill} className="ko-chip ko-mono">
            {skill}
          </span>
        ))}
        {project.skillsNeeded.length > 4 && (
          <span className="ko-chip ko-mono">+{project.skillsNeeded.length - 4}</span>
        )}
      </div>
      <div className="ko-pcard__meta ko-mono">
        <span>by {project.ownerName}</span>
        <span>{timeAgo(project.createdAt)}</span>
      </div>
    </Link>
  )
}
