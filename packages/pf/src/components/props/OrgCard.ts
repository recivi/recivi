import type { Org } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface OrgCardProps extends BaseProps {
	/** the org to render with all roles */
	org: Org;
}
