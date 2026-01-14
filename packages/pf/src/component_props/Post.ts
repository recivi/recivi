import type { CollectionEntry } from 'astro:content'

import type { BaseProps } from './base'

export interface PostProps extends BaseProps {
  /** the post collection entry */
  post: CollectionEntry<'blog'>
}

/**
 * Validate that the given value matches the `PostProps` interface.
 *
 * @param val the value to validate and type assert
 * @return whether value matches the `PostProps` interface
 */
export function isPostProps(val: unknown): val is PostProps {
  return val !== null && typeof val === 'object' && 'post' in val
}
