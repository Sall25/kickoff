import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'
import type { OnboardingContent } from '../api/types'

// This module is only ever loaded through a dynamic import (see
// OnboardingView), so @react-pdf/renderer stays out of the main bundle.

export type PdfSection =
  | 'welcome'
  | 'tools'
  | 'apps'
  | 'schedule'
  | 'checklist'
  | 'notes'

// All strings arrive pre-translated: the PDF renders in whatever language
// the person had active when they hit download.
export type PdfLabels = {
  kitTitle: string
  updated: string
  sections: Record<PdfSection, string>
  daysLong: string[]
  coreHoursText: string
  timezoneText: string
  requiredTag: string
}

const TEAL = '#0C8892'
const INK = '#1c1c1c'
const MUTED = '#6b6b6b'
const RULE = '#e3e3e3'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: INK,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 52,
  },
  kitTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: TEAL,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  projectTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    lineHeight: 1.2,
    marginBottom: 4,
  },
  updated: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  paragraph: {
    lineHeight: 1.5,
    marginBottom: 6,
  },
  linkRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  linkName: {
    fontFamily: 'Helvetica-Bold',
    width: 130,
    lineHeight: 1.35,
    paddingRight: 8,
  },
  linkUrl: {
    color: TEAL,
    textDecoration: 'none',
    flex: 1,
    lineHeight: 1.35,
  },
  listRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listNum: {
    fontFamily: 'Helvetica-Bold',
    color: TEAL,
    width: 22,
    lineHeight: 1.4,
  },
  listBody: {
    flex: 1,
  },
  listText: {
    lineHeight: 1.4,
  },
  listReq: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    letterSpacing: 0.5,
    color: TEAL,
    textTransform: 'uppercase',
    lineHeight: 1.4,
  },
  listUrl: {
    color: TEAL,
    textDecoration: 'none',
    lineHeight: 1.4,
    marginTop: 1,
  },
  noteHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    lineHeight: 1.3,
    marginBottom: 2,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 52,
    right: 52,
    fontSize: 8,
    color: MUTED,
    textAlign: 'center',
  },
})

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split('\n\n')
        .filter((p) => p.trim())
        .map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}
    </>
  )
}

function LinkList({ links }: { links: OnboardingContent['tools'] }) {
  return (
    <>
      {links.map((link) => (
        <View key={link.id} style={styles.linkRow}>
          <Text style={styles.linkName}>{link.name}</Text>
          <Link src={link.url} style={styles.linkUrl}>
            {link.url}
          </Link>
        </View>
      ))}
    </>
  )
}

function hasContent(content: OnboardingContent, section: PdfSection): boolean {
  switch (section) {
    case 'welcome':
      return Boolean(content.welcome.trim())
    case 'tools':
      return content.tools.length > 0
    case 'apps':
      return content.apps.length > 0
    case 'schedule':
      return content.schedule.days.length > 0
    case 'checklist':
      return content.checklist.length > 0
    case 'notes':
      return content.notes.length > 0
  }
}

function OnboardingDocument({
  projectTitle,
  content,
  labels,
  only,
}: {
  projectTitle: string
  content: OnboardingContent
  labels: PdfLabels
  only?: PdfSection
}) {
  const sections: PdfSection[] = only
    ? [only]
    : (
      ['welcome', 'tools', 'apps', 'schedule', 'checklist', 'notes'] as const
    ).filter((s) => hasContent(content, s))

  return (
    <Document title={`${projectTitle} — ${labels.kitTitle}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.kitTitle}>{labels.kitTitle}</Text>
        <Text style={styles.projectTitle}>{projectTitle}</Text>
        <Text style={styles.updated}>{labels.updated}</Text>

        {sections.map((section) => (
          <View key={section} style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.sections[section]}</Text>

            {section === 'welcome' && <Paragraphs text={content.welcome} />}

            {section === 'tools' && <LinkList links={content.tools} />}

            {section === 'apps' && <LinkList links={content.apps} />}

            {section === 'schedule' && (
              <>
                <Text style={styles.paragraph}>
                  {labels.daysLong.join(' · ')}
                </Text>
                {labels.coreHoursText ? (
                  <Text style={styles.paragraph}>{labels.coreHoursText}</Text>
                ) : null}
                {labels.timezoneText ? (
                  <Text style={styles.paragraph}>{labels.timezoneText}</Text>
                ) : null}
              </>
            )}

            {section === 'checklist' &&
              content.checklist.map((item, i) => (
                <View key={item.id} style={styles.listRow}>
                  <Text style={styles.listNum}>{i + 1}.</Text>
                  <View style={styles.listBody}>
                    <Text style={styles.listText}>
                      {item.text}
                      {item.required ? (
                        <Text style={styles.listReq}>
                          {'   '}
                          {labels.requiredTag}
                        </Text>
                      ) : null}
                    </Text>
                    {item.url ? (
                      <Link src={item.url} style={styles.listUrl}>
                        {item.url}
                      </Link>
                    ) : null}
                  </View>
                </View>
              ))}

            {section === 'notes' &&
              content.notes.map((note) => (
                <View key={note.id}>
                  <Text style={styles.noteHeading}>{note.heading}</Text>
                  <Paragraphs text={note.body} />
                </View>
              ))}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {projectTitle} — kickoff
        </Text>
      </Page>
    </Document>
  )
}

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'project'
  )
}

export async function downloadOnboardingPdf(
  projectTitle: string,
  content: OnboardingContent,
  labels: PdfLabels,
  only?: PdfSection,
): Promise<void> {
  const blob = await pdf(
    <OnboardingDocument
      projectTitle={projectTitle}
      content={content}
      labels={labels}
      only={only}
    />,
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = only
    ? `${slug(projectTitle)}-onboarding-${only}.pdf`
    : `${slug(projectTitle)}-onboarding.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}