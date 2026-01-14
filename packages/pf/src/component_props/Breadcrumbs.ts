import type { AnchorProps } from './Anchor'
import type { BaseProps } from './base'

export interface BreadcrumbsProps extends BaseProps {
  /** the list of anchors to the ancestors of the current page */
  crumbs: (AnchorProps | string)[]
}
