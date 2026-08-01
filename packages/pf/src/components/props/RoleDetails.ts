import type { Role } from "@recivi/schema";

import type { BaseProps } from "./base";

export interface RoleDetailsProps extends BaseProps {
	/** the role to render */
	role: Role;
	/** the number by which to offset the heading level */
	headingOffset?: number;
}
