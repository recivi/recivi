import type { Org } from '@recivi/schema'

import type { BaseProps } from './base'

export interface OrgDetailsProps extends BaseProps {
  /** the org to render with all roles */
  org: Org
  /** the number by which to offset the heading level */
  headingOffset?: number
  /** whether to render description or summary */
  isVerbose?: boolean
  /** optional tag to filter roles by */
  filterTag?: string | undefined
}
