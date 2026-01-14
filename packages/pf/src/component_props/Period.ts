import type { Period } from '@recivi/schema'

import type { BaseProps } from './base'

export interface PeriodProps extends BaseProps {
  /** the period to render */
  period: Period
}

/**
 * Validate that the given value matches the `PeriodProps` interface.
 *
 * @param val the value to validate and type assert
 * @return whether value matches the `PeriodProps` interface
 */
export function isPeriodProps(val: unknown): val is PeriodProps {
  return val !== null && typeof val === 'object' && 'period' in val
}
