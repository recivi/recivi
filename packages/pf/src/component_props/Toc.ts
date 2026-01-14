import type { MarkdownHeading } from 'astro'

import type { BaseProps } from './base'

export interface TocProps extends BaseProps {
  /** the list of headings to render in the ToC */
  headings: MarkdownHeading[]
}
