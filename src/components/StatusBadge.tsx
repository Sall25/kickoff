import { useTranslation } from 'react-i18next'
import type { RequestStatus } from '../api/types'
import { Badge, type BadgeProps } from '../primitives/badge'

// Variant is data (status -> color), stays untranslated.
const STATUS_VARIANT: Record<RequestStatus, BadgeProps['variant']> = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
  withdrawn: 'gray',
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant={STATUS_VARIANT[status]} size="small">
      {t(`requests.status.${status}`)}
    </Badge>
  )
}
