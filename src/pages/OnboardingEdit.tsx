import { useState } from 'react'
import { Link, useMatch } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import {
  LINK_KINDS,
  emptyOnboardingContent,
  type ChecklistItem,
  type LinkKind,
  type NoteSection,
  type OnboardingContent,
  type OnboardingLink,
} from '../api/types'
import { DayPicker } from '../components/DayPicker'
import { OnboardingKitView } from '../components/OnboardingKitView'
import { useOnboardingOwner, useSaveOnboarding } from '../hooks/useOnboarding'
import { useProject } from '../hooks/useProjects'
import { ClearIcon } from '../icons'
import { LINK_ICONS } from '../lib/link-icons'
import { Button } from '../primitives/button'
import { Input } from '../primitives/input'
import { TextareaAutosize } from '../primitives/textarea-autosize'

export function OnboardingEdit() {
  const { t } = useTranslation()
  const {
    params: { projectId },
  } = useMatch()

  const { data: project } = useProject(projectId)
  const ownerFetch = useOnboardingOwner(projectId)
  const save = useSaveOnboarding(projectId)

  const [ownerEmail, setOwnerEmail] = useState('')
  const [content, setContent] = useState<OnboardingContent | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  const unlocked = content !== null

  function unlock() {
    const email = ownerEmail.trim()
    if (!email || ownerFetch.isPending) return
    ownerFetch.mutate(email, {
      onSuccess: ({ onboarding }) => {
        setContent(onboarding?.content ?? emptyOnboardingContent())
        setSavedAt(onboarding?.updatedAt ?? null)
      },
    })
  }

  function handleSave() {
    if (!content || save.isPending) return
    save.mutate(
      { ownerEmail: ownerEmail.trim(), content },
      { onSuccess: ({ updatedAt }) => setSavedAt(updatedAt) },
    )
  }

  /* ------------------------------------------------------ content updates */

  function patch(partial: Partial<OnboardingContent>) {
    setContent((prev) => (prev ? { ...prev, ...partial } : prev))
  }

  function patchLinks(field: 'tools' | 'apps', links: OnboardingLink[]) {
    patch({ [field]: links })
  }

  /* --------------------------------------------------------------- gate */

  if (!unlocked) {
    const gateError =
      ownerFetch.error instanceof Error ? ownerFetch.error.message : null
    return (
      <section className="ko-shell ko-page ko-page--narrow">
        <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
          {t('onboarding.backToProject')}
        </Link>
        <div className="ko-card ko-form ko-obgate">
          <div>
            <p className="ko-eyebrow ko-mono">{t('onboarding.editEyebrow')}</p>
            <h1 className="ko-h2">{t('onboarding.editTitle')}</h1>
            {project && <p className="ko-lede">{project.title}</p>}
            <p className="ko-body">{t('onboarding.editLede')}</p>
          </div>
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="ob-owner-email">
              {t('onboarding.gateLabel')}
            </label>
            <Input
              id="ob-owner-email"
              className="ko-input"
              type="email"
              placeholder={t('onboarding.gatePlaceholder')}
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && unlock()}
            />
            <p className="ko-note ko-mono">{t('onboarding.gateHint')}</p>
          </div>
          {gateError && (
            <p className="ko-note ko-note--error ko-mono">
              {gateError === 'owner_mismatch'
                ? t('onboarding.gateError')
                : t('onboarding.loadError')}
            </p>
          )}
          <Button
            type="button"
            disabled={!ownerEmail.trim() || ownerFetch.isPending}
            onClick={unlock}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <span className="tiptap-button-text">
              {ownerFetch.isPending
                ? t('onboarding.unlocking')
                : t('onboarding.gateUnlock')}
            </span>
          </Button>
        </div>
      </section>
    )
  }

  /* -------------------------------------------------------------- builder */

  return (
    <section className="ko-shell ko-page ko-page--narrow ko-ob">
      <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
        {t('onboarding.backToProject')}
      </Link>

      <p className="ko-eyebrow ko-mono">{t('onboarding.editEyebrow')}</p>
      <h1 className="ko-h1">{t('onboarding.editTitle')}</h1>
      {project && <p className="ko-lede">{project.title}</p>}

      {savedAt && (
        <div className="ko-card ko-obshare">
          <p className="ko-eyebrow ko-mono ko-success__eyebrow">
            {t('onboarding.savedTitle')}
          </p>
          <p className="ko-body">{t('onboarding.savedBodyMembership')}</p>
          <button
            type="button"
            className="ko-btn-link ko-mono"
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? t('onboarding.hidePreview') : t('onboarding.preview')}
          </button>
        </div>
      )}

      {preview && content && project && (
        <section className="ko-ob ko-ob--preview">
          <OnboardingKitView
            content={content}
            projectTitle={project.title}
            updatedAt={savedAt}
          />
        </section>
      )}

      <div className="ko-form ko-obform">
        <div className="ko-field">
          <label className="ko-label ko-mono" htmlFor="ob-welcome">
            {t('onboarding.welcomeLabel')}
          </label>
          <TextareaAutosize
            id="ob-welcome"
            minRows={3}
            maxRows={12}
            placeholder={t('onboarding.welcomePlaceholder')}
            value={content.welcome}
            onChange={(event) => patch({ welcome: event.target.value })}
          />
        </div>

        <LinkListEditor
          label={t('onboarding.toolsLabel')}
          hint={t('onboarding.toolsHint')}
          links={content.tools}
          onChange={(links) => patchLinks('tools', links)}
        />

        <LinkListEditor
          label={t('onboarding.appsLabel')}
          hint={t('onboarding.appsHint')}
          links={content.apps}
          onChange={(links) => patchLinks('apps', links)}
        />

        <div className="ko-field">
          <span className="ko-label ko-mono">
            {t('onboarding.scheduleLabel')}
          </span>
          <DayPicker
            value={content.schedule.days}
            onChange={(days) =>
              patch({ schedule: { ...content.schedule, days } })
            }
          />
        </div>

        <div className="ko-form__row ko-obform__schedule">
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="ob-core-start">
              {t('onboarding.coreStart')}
            </label>
            <Input
              id="ob-core-start"
              className="ko-input"
              type="time"
              value={content.schedule.coreStart}
              onChange={(event) =>
                patch({
                  schedule: { ...content.schedule, coreStart: event.target.value },
                })
              }
            />
          </div>
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="ob-core-end">
              {t('onboarding.coreEnd')}
            </label>
            <Input
              id="ob-core-end"
              className="ko-input"
              type="time"
              value={content.schedule.coreEnd}
              onChange={(event) =>
                patch({
                  schedule: { ...content.schedule, coreEnd: event.target.value },
                })
              }
            />
          </div>
          <div className="ko-field ko-field--grow">
            <label className="ko-label ko-mono" htmlFor="ob-timezone">
              {t('onboarding.timezoneLabel')}
            </label>
            <Input
              id="ob-timezone"
              className="ko-input"
              value={content.schedule.timezone}
              onChange={(event) =>
                patch({
                  schedule: { ...content.schedule, timezone: event.target.value },
                })
              }
            />
          </div>
        </div>

        <ChecklistEditor
          items={content.checklist}
          onChange={(checklist) => patch({ checklist })}
        />

        <NotesEditor
          notes={content.notes}
          onChange={(notes) => patch({ notes })}
        />

        {save.isError && (
          <p className="ko-note ko-note--error ko-mono">
            {save.error instanceof Error &&
              save.error.message === 'owner_mismatch'
              ? t('onboarding.gateError')
              : t('onboarding.saveError')}
          </p>
        )}

        <Button
          type="button"
          disabled={save.isPending}
          onClick={handleSave}
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <span className="tiptap-button-text">
            {save.isPending ? t('onboarding.saving') : t('onboarding.save')}
          </span>
        </Button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ sub-editors */

function LinkListEditor({
  label,
  hint,
  links,
  onChange,
}: {
  label: string
  hint: string
  links: OnboardingLink[]
  onChange: (links: OnboardingLink[]) => void
}) {
  const { t } = useTranslation()

  function update(id: string, partial: Partial<OnboardingLink>) {
    onChange(links.map((l) => (l.id === id ? { ...l, ...partial } : l)))
  }

  function add() {
    onChange([
      ...links,
      { id: crypto.randomUUID(), name: '', url: '', kind: 'other' },
    ])
  }

  return (
    <div className="ko-field">
      <span className="ko-label ko-mono">{label}</span>
      <p className="ko-note ko-mono">{hint}</p>
      {links.map((link) => {
        const Icon = LINK_ICONS[link.kind] ?? LINK_ICONS.other
        return (
          <div key={link.id} className="ko-obrow">
            <span className="ko-obrow__icon" aria-hidden="true">
              <Icon width={18} height={18} />
            </span>
            <select
              className="ko-select"
              aria-label={t('onboarding.linkKind')}
              value={link.kind}
              onChange={(event) =>
                update(link.id, { kind: event.target.value as LinkKind })
              }
            >
              {LINK_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.value === 'other'
                    ? t('onboarding.kindOther')
                    : kind.label}
                </option>
              ))}
            </select>
            <Input
              className="ko-input"
              aria-label={t('onboarding.linkName')}
              placeholder={t('onboarding.linkName')}
              value={link.name}
              onChange={(event) => update(link.id, { name: event.target.value })}
            />
            <Input
              className="ko-input"
              aria-label={t('onboarding.linkUrl')}
              type="url"
              placeholder="https://"
              value={link.url}
              onChange={(event) => update(link.id, { url: event.target.value })}
            />
            <RemoveButton
              onClick={() => onChange(links.filter((l) => l.id !== link.id))}
            />
          </div>
        )
      })}
      <button type="button" className="ko-obadd ko-mono" onClick={add}>
        + {t('onboarding.addLink')}
      </button>
    </div>
  )
}

function ChecklistEditor({
  items,
  onChange,
}: {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}) {
  const { t } = useTranslation()

  function update(id: string, partial: Partial<ChecklistItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...partial } : i)))
  }

  return (
    <div className="ko-field">
      <span className="ko-label ko-mono">{t('onboarding.checklistLabel')}</span>
      <p className="ko-note ko-mono">{t('onboarding.checklistHint')}</p>
      {items.map((item, index) => (
        <div key={item.id} className="ko-obrow ko-obrow--step">
          <span className="ko-obrow__num ko-mono" aria-hidden="true">
            {index + 1}
          </span>
          <Input
            className="ko-input"
            aria-label={t('onboarding.stepText')}
            placeholder={t('onboarding.stepText')}
            value={item.text}
            onChange={(event) => update(item.id, { text: event.target.value })}
          />
          <Input
            className="ko-input"
            aria-label={t('onboarding.stepUrl')}
            type="url"
            placeholder={t('onboarding.stepUrl')}
            value={item.url}
            onChange={(event) => update(item.id, { url: event.target.value })}
          />
          <button
            type="button"
            className="ko-obreq ko-mono"
            data-active={item.required || undefined}
            aria-pressed={Boolean(item.required)}
            onClick={() => update(item.id, { required: !item.required })}
          >
            {t('onboarding.required')}
          </button>
          <RemoveButton
            onClick={() => onChange(items.filter((i) => i.id !== item.id))}
          />
        </div>
      ))}
      <button
        type="button"
        className="ko-obadd ko-mono"
        onClick={() =>
          onChange([
            ...items,
            { id: crypto.randomUUID(), text: '', url: '', required: false },
          ])
        }
      >
        + {t('onboarding.addStep')}
      </button>
    </div>
  )
}

function NotesEditor({
  notes,
  onChange,
}: {
  notes: NoteSection[]
  onChange: (notes: NoteSection[]) => void
}) {
  const { t } = useTranslation()

  function update(id: string, partial: Partial<NoteSection>) {
    onChange(notes.map((n) => (n.id === id ? { ...n, ...partial } : n)))
  }

  return (
    <div className="ko-field">
      <span className="ko-label ko-mono">{t('onboarding.notesLabel')}</span>
      {notes.map((note) => (
        <div key={note.id} className="ko-obnote">
          <div className="ko-obrow">
            <Input
              className="ko-input"
              aria-label={t('onboarding.noteHeading')}
              placeholder={t('onboarding.noteHeading')}
              value={note.heading}
              onChange={(event) =>
                update(note.id, { heading: event.target.value })
              }
            />
            <RemoveButton
              onClick={() => onChange(notes.filter((n) => n.id !== note.id))}
            />
          </div>
          <TextareaAutosize
            minRows={3}
            maxRows={12}
            aria-label={t('onboarding.noteBody')}
            placeholder={t('onboarding.noteBody')}
            value={note.body}
            onChange={(event) => update(note.id, { body: event.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        className="ko-obadd ko-mono"
        onClick={() =>
          onChange([
            ...notes,
            { id: crypto.randomUUID(), heading: '', body: '' },
          ])
        }
      >
        + {t('onboarding.addNote')}
      </button>
    </div>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      className="ko-obremove"
      aria-label={t('onboarding.remove')}
      title={t('onboarding.remove')}
      onClick={onClick}
    >
      <ClearIcon width={18} height={18} />
    </button>
  )
}