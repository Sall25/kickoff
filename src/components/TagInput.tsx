import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type TagInputProps = {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ id, value, onChange, placeholder }: TagInputProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')

  function commit() {
    const tag = draft.trim().toLowerCase()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="ko-taginput">
      {value.map((tag) => (
        <span key={tag} className="ko-chip">
          {tag}
          <button
            type="button"
            className="ko-chip__remove"
            aria-label={t('taginput.remove', { tag })}
            onClick={() => onChange(value.filter((x) => x !== tag))}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        className="ko-taginput__input"
        value={draft}
        placeholder={value.length ? '' : placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
    </div>
  )
}