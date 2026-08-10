import type { Institute } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface InstituteCardProps extends BaseProps {
	/** the institute to render with all certs */
	institute: Institute;
}
