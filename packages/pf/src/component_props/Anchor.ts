import type { Url } from '@recivi/schema'

import type { BaseProps } from './base'

export interface AnchorProps extends BaseProps {
  /** the URL to link to */
  url: Url
}

/**
 * Validate that the given value matches the `AnchorProps` interface.
 *
 * @param val the value to validate and type assert
 * @return whether value matches the `AnchorProps` interface
 */
export function isAnchorProps(val: unknown): val is AnchorProps {
  return val !== null && typeof val === 'object' && 'url' in val
}
