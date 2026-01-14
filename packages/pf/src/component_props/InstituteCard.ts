import type { Institute } from '@recivi/schema'

import type { BaseProps } from './base'

export interface InstituteCardProps extends BaseProps {
  /** the institute to render with all certs */
  institute: Institute
}
