import type { LinkKind } from '../api/types'
import {
  DiscordIcon,
  FigmaIcon,
  GithubIcon,
  GoogleMeetIcon,
  LinearIcon,
  LinkIcon,
  NotionIcon,
  SlackIcon,
  TrelloIcon,
  ZoomIcon,
} from '../icons'

type SvgProps = React.ComponentPropsWithoutRef<'svg'>

export const LINK_ICONS: Record<
  LinkKind,
  React.ComponentType<SvgProps>
> = {
  github: GithubIcon,
  figma: FigmaIcon,
  slack: SlackIcon,
  discord: DiscordIcon,
  notion: NotionIcon,
  trello: TrelloIcon,
  linear: LinearIcon,
  zoom: ZoomIcon,
  meet: GoogleMeetIcon,
  other: LinkIcon,
}
