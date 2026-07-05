import type { Stage } from '../api/types'

const LABELS: Record<Stage, string> = {
  idea: 'Idea',
  building: 'Building',
  launching: 'Launching',
}

export function StageBadge({ stage }: { stage: Stage }) {
  return <span className={`ko-stage ko-stage--${stage} ko-mono`}>{LABELS[stage]}</span>
}
