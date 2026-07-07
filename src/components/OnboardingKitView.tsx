import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DAYS, type OnboardingContent } from '../api/types'
import { ToolLink } from './ToolLink'
import { DownloadIcon } from '../icons'
import type { PdfLabels, PdfSection } from '../lib/onboarding-pdf'
import { Button } from '../primitives/button'

// Pure presentation: given kit content, render the sections and handle PDF
// export. No data fetching and no access logic — the member viewer and the
// owner's in-builder preview both feed it content they already hold.
export function OnboardingKitView({
  content,
  projectTitle,
  updatedAt,
}: {
  content: OnboardingContent
  projectTitle: string
  updatedAt: string | null
}) {
  const { t, i18n } = useTranslation()
  const [downloading, setDownloading] = useState<PdfSection | 'all' | null>(null)

  const updatedText = updatedAt
    ? t('onboarding.updated', {
      time: new Date(updatedAt).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })
    : ''

  async function download(section?: PdfSection) {
    if (downloading) return
    setDownloading(section ?? 'all')
    try {
      const { downloadOnboardingPdf } = await import('../lib/onboarding-pdf')
      const labels: PdfLabels = {
        kitTitle: t('onboarding.title'),
        updated: updatedText,
        sections: {
          welcome: t('onboarding.sectionWelcome'),
          tools: t('onboarding.sectionTools'),
          apps: t('onboarding.sectionApps'),
          schedule: t('onboarding.sectionSchedule'),
          checklist: t('onboarding.sectionChecklist'),
          notes: t('onboarding.sectionNotes'),
        },
        daysLong: content.schedule.days.map((d) => t(`onboarding.daysLong.${d}`)),
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
      await downloadOnboardingPdf(projectTitle, content, labels, section)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <>
      <header className="ko-ob__head">
        <div>
          <p className="ko-eyebrow ko-mono">{t('onboarding.eyebrow')}</p>
          <h1 className="ko-h1">{t('onboarding.title')}</h1>
          <p className="ko-lede">{projectTitle}</p>
          {updatedText && <p className="ko-note ko-mono">{updatedText}</p>}
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
    </>
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