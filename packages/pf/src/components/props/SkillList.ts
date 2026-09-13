import type { BaseProps } from "../../types/props";

export interface SkillListProps extends BaseProps {
	/** optional tag to filter skills by */
	filterTag?: string | undefined;
}
