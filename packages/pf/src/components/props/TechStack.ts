import type { Tech } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface TechStackProps extends BaseProps {
	/** a list of technologies to render */
	technologies: Tech[];
	/** whether to show the names of the technologies */
	showNames?: boolean;
}

/**
 * Validate that the given value matches the `TechStackProps` interface.
 *
 * @param val the value to validate and type assert
 * @returns whether value matches the `TechStackProps` interface
 */
export function isTechStackProps(val: unknown): val is TechStackProps {
	return val !== null && typeof val === "object" && "technologies" in val;
}
