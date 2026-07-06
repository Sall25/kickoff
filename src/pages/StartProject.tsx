import { useState } from 'react'
import { useNavigate } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { CATEGORIES, STAGES, type Category, type Stage } from '../api/types'
import { Card } from '../primitives/card'
import { Input } from '../primitives/input'
import { TextareaAutosize } from '../primitives/textarea-autosize'
import { Button } from '../primitives/button'
import { TagInput } from '../components/TagInput'
import { useCreateProject } from '../hooks/useProjects'

export function StartProject() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createProject = useCreateProject()

  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('web')
  const [stage, setStage] = useState<Stage>('idea')
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([])
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')

  const canSubmit =
    Boolean(
      title.trim() &&
      pitch.trim() &&
      description.trim() &&
      ownerName.trim() &&
      ownerEmail.trim(),
    ) && !createProject.isPending

  function handleSubmit() {
    if (!canSubmit) return
    createProject.mutate(
      {
        title: title.trim(),
        pitch: pitch.trim(),
        description: description.trim(),
        category,
        stage,
        skillsNeeded,
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
      },
      {
        onSuccess: (created) => navigate({ to: `/projects/${created.id}` }),
      },
    )
  }

  return (
    <section className="ko-shell ko-page ko-page--narrow">
      <p className="ko-eyebrow">{t('start.eyebrow')}</p>
      <h1 className="ko-h1">{t('common.startProject')}</h1>
      <p className="ko-lede">{t('start.lede')}</p>

      <Card className="ko-form">
        <div className="ko-field">
          <label className="ko-label" htmlFor="p-title">
            {t('start.titleLabel')}
          </label>
          <Input
            id="p-title"
            className="ko-input"
            placeholder={t('start.titlePlaceholder')}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="ko-field">
          <label className="ko-label" htmlFor="p-pitch">
            {t('start.pitchLabel')}
          </label>
          <Input
            id="p-pitch"
            className="ko-input"
            placeholder={t('start.pitchPlaceholder')}
            value={pitch}
            onChange={(event) => setPitch(event.target.value)}
          />
        </div>

        <div className="ko-field">
          <label className="ko-label" htmlFor="p-description">
            {t('start.descriptionLabel')}
          </label>
          <TextareaAutosize
            id="p-description"
            // className="ko-input"
            minRows={4}
            maxRows={16}
            placeholder={t('start.descriptionPlaceholder')}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="ko-form__row">
          <div className="ko-field">
            <label className="ko-label" htmlFor="p-category">
              {t('start.categoryLabel')}
            </label>
            <select
              id="p-category"
              className="ko-select"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {t(`category.${c.value}`, { defaultValue: c.label })}
                </option>
              ))}
            </select>
          </div>
          <div className="ko-field">
            <span className="ko-label">{t('start.stageLabel')}</span>
            <div className="ko-radio-group" role="radiogroup" aria-label={t('start.stageLabel')}>
              {STAGES.map((s) => (
                <label key={s.value} className="ko-radio" title={t(`stageHint.${s.value}`, { defaultValue: s.hint })}>
                  <input
                    type="radio"
                    name="stage"
                    value={s.value}
                    checked={stage === s.value}
                    onChange={() => setStage(s.value)}
                  />
                  <span>{t(`stage.${s.value}`, { defaultValue: s.label })}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="ko-field">
          <label className="ko-label" htmlFor="p-skills">
            {t('start.skillsLabel')}
          </label>
          <TagInput
            id="p-skills"
            value={skillsNeeded}
            onChange={setSkillsNeeded}
            placeholder={t('start.skillsPlaceholder')}
          />
        </div>

        <div className="ko-form__row">
          <div className="ko-field">
            <label className="ko-label" htmlFor="p-owner-name">
              {t('common.yourName')}
            </label>
            <Input
              id="p-owner-name"
              className="ko-input"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
            />
          </div>
          <div className="ko-field">
            <label className="ko-label" htmlFor="p-owner-email">
              {t('common.email')}
            </label>
            <Input
              id="p-owner-email"
              className="ko-input"
              type="email"
              placeholder={t('start.emailPlaceholder')}
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
            />
          </div>
        </div>

        {createProject.isError && (
          <p className="ko-note ko-note--error">{t('start.publishError')}</p>
        )}

        <Button
          data-style="primary"
          data-size="large"
          className="ko-btn-block"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {createProject.isPending ? t('start.publishing') : t('start.publish')}
        </Button>
      </Card>
    </section>
  )
}