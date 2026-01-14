import type { LinkTag, MetaTag } from '../types/tags'
import type { BaseProps } from './base'

export type ElementsProps = BaseProps &
  (
    | {
        tag: 'link'
        /** the attributes of the `<link>` tags to render */
        items: LinkTag[]
      }
    | {
        tag: 'meta'
        /** the attributes of the `<meta>` tags to render */
        items: MetaTag[]
      }
  )
