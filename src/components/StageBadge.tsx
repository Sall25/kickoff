import { useTranslation } from 'react-i18next'
import type { Stage } from '../api/types'
import { Badge, type BadgeProps } from '../primitives/badge'

// Variant is data (maps stage -> badge color), stays untranslated.
const STAGE_VARIANT: Record<Stage, BadgeProps['variant']> = {
  idea: 'yellow',
  building: 'brand',
  launching: 'green',
}

export function StageBadge({ stage }: { stage: Stage }) {
  const { t } = useTranslation()
  return (
    <Badge variant={STAGE_VARIANT[stage]} size="small">
      {t(`stage.${stage}`)}
    </Badge>
  )
}