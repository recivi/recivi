import type { AnchorProps } from '../component_props/Anchor'
import type { EntityProps } from '../component_props/Entity'
import type { PeriodProps } from '../component_props/Period'
import type { PfDateProps } from '../component_props/PfDate'
import type { PostProps } from '../component_props/Post'
import type { TechStackProps } from '../component_props/TechStack'
import type { WithUndefinedValues } from './utils'

/**
 * registry of available renderers and the type of data they can render; In
 * theory, any component can be a table renderer, but most components don't make
 * much sense to be displayed inside a cell.
 */
export type RendererRegistry = WithUndefinedValues<{
  Anchor: AnchorProps
  Entity: EntityProps
  Period: PeriodProps
  PfDate: PfDateProps
  Post: PostProps
  TechStack: TechStackProps
  Text: string
}>

export type Renderer = keyof RendererRegistry
