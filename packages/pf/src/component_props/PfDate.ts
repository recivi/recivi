import type { Date as RcvDate } from '@recivi/schema'

import type { BaseProps } from './base'

export interface PfDateProps extends BaseProps {
  /**
   * the date to display; This can be a Récivi date, which can be in
   * many formats or a JS `Date` instance.
   */
  date: RcvDate | globalThis.Date
}

/**
 * Validate that the given value matches the `DateProps` interface.
 *
 * @param val the value to validate and type assert
 * @return whether value matches the `PfDateProps` interface
 */
export function isPfDateProps(val: unknown): val is PfDateProps {
  return val !== null && typeof val === 'object' && 'date' in val
}
