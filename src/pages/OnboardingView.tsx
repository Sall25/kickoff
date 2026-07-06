import { useState } from 'react'
import { Link, useMatch, useNavigate, useSearch } from '@tanstack/react-location'
import { useTranslation } from 'react-i18next'
import { DAYS } from '../api/types'
import { ToolLink } from '../components/ToolLink'
import { useOnboarding } from '../hooks/useOnboarding'
import { useProject } from '../hooks/useProjects'
import { DownloadIcon } from '../icons'
import type { PdfLabels, PdfSection } from '../lib/onboarding-pdf'
import { Button } from '../primitives/button'
import { Input } from '../primitives/input'

export function OnboardingView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    params: { projectId },
  } = useMatch()
  const search = useSearch()
  const shareKey = typeof search.k === 'string' && search.k ? search.k : null

  const { data: project } = useProject(projectId)
  const { data: kit, isLoading, error } = useOnboarding(projectId, shareKey)

  const [keyInput, setKeyInput] = useState('')
  const [downloading, setDownloading] = useState<PdfSection | 'all' | null>(null)

  function unlock() {
    const k = keyInput.trim()
    if (!k) return
    navigate({ search: (old) => ({ ...old, k }), replace: true })
  }

  async function download(section?: PdfSection) {
    if (!kit || !project || downloading) return
    setDownloading(section ?? 'all')
    try {
      const { downloadOnboardingPdf } = await import('../lib/onboarding-pdf')
      const { content } = kit
      const labels: PdfLabels = {
        kitTitle: t('onboarding.title'),
        updated: t('onboarding.updated', {
          time: new Date(kit.updatedAt).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        }),
        sections: {
          welcome: t('onboarding.sectionWelcome'),
          tools: t('onboarding.sectionTools'),
          apps: t('onboarding.sectionApps'),
          schedule: t('onboarding.sectionSchedule'),
          checklist: t('onboarding.sectionChecklist'),
          notes: t('onboarding.sectionNotes'),
        },
        daysLong: content.schedule.days.map((d) =>
          t(`onboarding.daysLong.${d}`),
        ),
        coreHoursText:
          content.schedule.coreStart && content.schedule.coreEnd
            ? t('onboarding.coreHours', {
                start: content.schedule.coreStart,
                end: content.schedule.coreEnd,
              })
            : '',
        timezoneText: content.schedule.timezone
          ? t('onboarding.timezone', { tz: content.schedule.timezone })
          : '',
      }
      await downloadOnboardingPdf(project.title, content, labels, section)
    } finally {
      setDownloading(null)
    }
  }

  const errorCode = error instanceof Error ? error.message : null

  if (shareKey && isLoading) {
    return (
      <section className="ko-shell ko-page">
        <p className="ko-note ko-mono">{t('onboarding.loading')}</p>
      </section>
    )
  }

  if (!shareKey || errorCode) {
    return (
      <section className="ko-shell ko-page ko-page--narrow">
        <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
          {t('onboarding.backToProject')}
        </Link>
        <div className="ko-card ko-form ko-obgate">
          <div>
            <p className="ko-eyebrow ko-mono">{t('onboarding.eyebrow')}</p>
            <h1 className="ko-h2">{t('onboarding.lockedTitle')}</h1>
            <p className="ko-body">{t('onboarding.lockedBody')}</p>
          </div>
          <div className="ko-field">
            <label className="ko-label ko-mono" htmlFor="ob-key">
              {t('onboarding.keyLabel')}
            </label>
            <Input
              id="ob-key"
              className="ko-input"
              placeholder={t('onboarding.keyPlaceholder')}
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && unlock()}
            />
          </div>
          {errorCode === 'not_found' && (
            <p className="ko-note ko-mono">{t('onboarding.notFound')}</p>
          )}
          {errorCode && errorCode !== 'not_found' && (
            <p className="ko-note ko-note--error ko-mono">
              {t('onboarding.wrongKey')}
            </p>
          )}
          <Button
            type="button"
            disabled={!keyInput.trim()}
            onClick={unlock}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <span className="tiptap-button-text">{t('onboarding.unlock')}</span>
          </Button>
        </div>
      </section>
    )
  }

  if (!kit) return null
  const { content } = kit

  return (
    <section className="ko-shell ko-page ko-page--narrow ko-ob">
      <Link to={`/projects/${projectId}`} className="ko-back ko-mono">
        {t('onboarding.backToProject')}
      </Link>

      <header className="ko-ob__head">
        <div>
          <p className="ko-eyebrow ko-mono">{t('onboarding.eyebrow')}</p>
          <h1 className="ko-h1">{t('onboarding.title')}</h1>
          {project && <p className="ko-lede">{project.title}</p>}
          <p className="ko-note ko-mono">
            {t('onboarding.updated', {
              time: new Date(kit.updatedAt).toLocaleDateString(i18n.language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            })}
          </p>
        </div>
        <Button
          type="button"
          disabled={downloading !== null}
          onClick={() => download()}
          style={{ alignItems: 'center' }}
        >
          <DownloadIcon width={16} height={16} />
          <span className="tiptap-button-text">
            {downloading === 'all'
              ? t('onboarding.preparingPdf')
              : t('onboarding.downloadAll')}
          </span>
        </Button>
      </header>

      {content.welcome.trim() && (
        <ObSection
          id="welcome"
          title={t('onboarding.sectionWelcome')}
          downloading={downloading}
          onDownload={download}
        >
          {content.welcome.split('\n\n').map((paragraph, index) => (
            <p key={index} className="ko-body">
              {paragraph}
            </p>
          ))}
        </ObSection>
      )}

      {content.tools.length > 0 && (
        <ObSection
          id="tools"
          title={t('onboarding.sectionTools')}
          downloading={downloading}
          onDownload={download}
        >
          <div className="ko-ob__tools">
            {content.tools.map((link) => (
              <ToolLink key={link.id} link={link} />
            ))}
          </div>
        </ObSection>
      )}

      {content.apps.length > 0 && (
        <ObSection
          id="apps"
          title={t('onboarding.sectionApps')}
          downloading={downloading}
          onDownload={download}
        >
          <div className="ko-ob__tools">
            {content.apps.map((link) => (
              <ToolLink key={link.id} link={link} />
            ))}
          </div>
        </ObSection>
      )}

      {content.schedule.days.length > 0 && (
        <ObSection
          id="schedule"
          title={t('onboarding.sectionSchedule')}
          downloading={downloading}
          onDownload={download}
        >
          <div className="ko-daypick ko-daypick--static">
            {DAYS.map((day) => (
              <span
                key={day}
                className="ko-daypick__day ko-mono"
                data-active={content.schedule.days.includes(day) || undefined}
              >
                {t(`onboarding.daysShort.${day}`)}
              </span>
            ))}
          </div>
          <p className="ko-body ko-ob__schedule-meta">
            {content.schedule.coreStart && content.schedule.coreEnd && (
              <span>
                {t('onboarding.coreHours', {
                  start: content.schedule.coreStart,
                  end: content.schedule.coreEnd,
                })}
              </span>
            )}
            {content.schedule.timezone && (
              <span className="ko-mono ko-ob__tz">
                {t('onboarding.timezone', { tz: content.schedule.timezone })}
              </span>
            )}
          </p>
        </ObSection>
      )}

      {content.checklist.length > 0 && (
        <ObSection
          id="checklist"
          title={t('onboarding.sectionChecklist')}
          downloading={downloading}
          onDownload={download}
        >
          <ol className="ko-ob__steps">
            {content.checklist.map((item) => (
              <li key={item.id} className="ko-body">
                {item.text}
                {item.url && (
                  <>
                    {' '}
                    <a
                      className="ko-ob__steplink"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.url}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ol>
        </ObSection>
      )}

      {content.notes.length > 0 && (
        <ObSection
          id="notes"
          title={t('onboarding.sectionNotes')}
          downloading={downloading}
          onDownload={download}
        >
          {content.notes.map((note) => (
            <div key={note.id} className="ko-ob__note">
              <h3 className="ko-h3">{note.heading}</h3>
              {note.body.split('\n\n').map((paragraph, index) => (
                <p key={index} className="ko-body">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </ObSection>
      )}

      <p className="ko-note ko-mono ko-ob__ownerlink">
        <Link to={`/projects/${projectId}/onboarding/edit`}>
          {t('onboarding.editLink')}
        </Link>
      </p>
    </section>
  )
}

function ObSection({
  id,
  title,
  downloading,
  onDownload,
  children,
}: {
  id: PdfSection
  title: string
  downloading: PdfSection | 'all' | null
  onDownload: (section: PdfSection) => void
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section className="ko-ob__section">
      <div className="ko-ob__section-head">
        <h2 className="ko-h3">{title}</h2>
        <button
          type="button"
          className="ko-ob__dl"
          disabled={downloading !== null}
          aria-label={t('onboarding.downloadSection', { section: title })}
          title={t('onboarding.downloadSection', { section: title })}
          onClick={() => onDownload(id)}
        >
          <DownloadIcon width={16} height={16} />
        </button>
      </div>
      {children}
    </section>
  )
}
