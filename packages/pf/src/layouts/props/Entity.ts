import type { BaseProps } from "../../types/props";

export interface EntityProps extends BaseProps {
	/** the type of the entity, singular and plural */
	entityType: [string, string];
	/** the name of the entity */
	name: string;
	/** the description of the entity page */
	description: string;
}
