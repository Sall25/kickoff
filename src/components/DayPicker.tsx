import { useTranslation } from 'react-i18next'
import { DAYS, type Day } from '../api/types'

type DayPickerProps = {
  value: Day[]
  onChange: (days: Day[]) => void
}

// Mon–Sun toggle pills. Selection order in state follows DAYS order so the
// viewer and the PDF always render the week consistently.
export function DayPicker({ value, onChange }: DayPickerProps) {
  const { t } = useTranslation()

  function toggle(day: Day) {
    const next = value.includes(day)
      ? value.filter((d) => d !== day)
      : DAYS.filter((d) => value.includes(d) || d === day)
    onChange(next)
  }

  return (
    <div className="ko-daypick" role="group">
      {DAYS.map((day) => {
        const active = value.includes(day)
        return (
          <button
            key={day}
            type="button"
            className="ko-daypick__day ko-mono"
            data-active={active || undefined}
            aria-pressed={active}
            onClick={() => toggle(day)}
          >
            {t(`onboarding.daysShort.${day}`)}
          </button>
        )
      })}
    </div>
  )
}
