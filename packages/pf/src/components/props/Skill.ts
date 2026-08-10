import type { Skill } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface SkillProps extends BaseProps {
	/** the skill to render */
	skill: Skill;
}
