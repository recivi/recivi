import type { Cert, Epic, Institute, Org, Project, Role } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface SubEntityProps extends BaseProps {
	/** the sub-entity to render */
	subEntity: Pick<Role | Project | Cert, "id" | "name">;
	/** the parent entity of the sub-entity */
	parent: Institute | Org | Epic;
}

/**
 * Validate that the given value matches the `SubEntityProps` interface.
 *
 * @param val the value to validate and type assert
 * @returns whether value matches the `SubEntityProps` interface
 */
export function isSubEntityProps(val: unknown): val is SubEntityProps {
	return val !== null && typeof val === "object" && "subEntity" in val && "parent" in val;
}
