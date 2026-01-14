import type { Epic, Institute, Org } from '@recivi/schema'

import type { BaseProps } from './base'

export interface EntityProps extends BaseProps {
  /** the entity to render */
  entity: Org | Epic | Institute
  /** whether the entity should use internal links */
  useInternalLink?: boolean
}

/**
 * Validate that the given value matches the `EntityProps` interface.
 *
 * @param val the value to validate and type assert
 * @return whether value matches the `EntityProps` interface
 */
export function isEntityProps(val: unknown): val is EntityProps {
  return val !== null && typeof val === 'object' && 'entity' in val
}
