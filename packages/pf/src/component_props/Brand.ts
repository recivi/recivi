import type { AnchorProps } from './Anchor'
import type { BaseProps } from './base'
import type { IconProps } from './Icon'

export interface BrandProps extends BaseProps {
  /** information about the brand's icon */
  icon?: IconProps | undefined
  /** an optional anchor to wrap the brand in */
  anchor?: AnchorProps | undefined
  /** the brand's display name */
  name: string
}
