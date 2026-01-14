import type { BaseProps } from './base'

export interface IconProps extends BaseProps {
  /**
   * the name of the icon pack to use for the icon; If this is not
   * specified, we will search all icon packs and use the find icon with
   * the given name.
   */
  pack?: string | undefined
  /**
   * the name of the icon to display; If this is an alias, both the icon
   * and pack name will be taken from the config, with the the prop
   * `pack` acting as a fallback.
   */
  name: string
  /** the text to show when the mouse hovers on the icon */
  title?: string | undefined
}
