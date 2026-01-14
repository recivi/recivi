import type { Epic } from '@recivi/schema'

import type { BaseProps } from './base'

export interface EpicCardProps extends BaseProps {
  /** the epic to render with all projects */
  epic: Epic
}
