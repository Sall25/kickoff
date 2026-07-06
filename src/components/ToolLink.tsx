import type { OnboardingLink } from '../api/types'
import { LINK_ICONS } from '../lib/link-icons'

// A tool/app rendered as its icon with the URL embedded — the whole tile
// is the anchor. Used by the onboarding viewer.
export function ToolLink({ link }: { link: OnboardingLink }) {
  const Icon = LINK_ICONS[link.kind] ?? LINK_ICONS.other
  return (
    <a
      className="ko-tool"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={link.url}
    >
      <span className="ko-tool__icon" aria-hidden="true">
        <Icon width={22} height={22} />
      </span>
      <span className="ko-tool__name">{link.name}</span>
    </a>
  )
}
