import type { BaseProps } from './base'

export interface CommsProps extends BaseProps {
  /** filter profiles that match the given tag */
  filterTag?: string | undefined
  /** whether to include a link to the portfolio site */
  includeWeb?: boolean
}
