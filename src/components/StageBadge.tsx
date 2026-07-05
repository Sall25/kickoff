import type { Stage } from '../api/types'
import { Badge, type BadgeProps } from '../primitives/badge';

const STAGE: Record<Stage, { label: string; variant: BadgeProps['variant'] }> = {
  idea: { label: 'Idea', variant: 'yellow' },
  building: { label: 'Building', variant: 'brand' },
  launching: { label: 'Launching', variant: 'green' },
}

export function StageBadge({ stage }: { stage: Stage }) {
  const { label, variant } = STAGE[stage]
  return <Badge variant={variant} size="small">{label}</Badge>
}