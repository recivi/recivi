import type { Skill } from '@recivi/schema'

import type { BaseProps } from './base'

export interface SkillProps extends BaseProps {
  /** the skill to render */
  skill: Skill
}
