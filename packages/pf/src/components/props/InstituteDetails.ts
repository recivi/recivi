import type { Institute } from "@recivi/schema";

import type { BaseProps } from "./base";

export interface InstituteDetailsProps extends BaseProps {
	/** the institute to render with all projects */
	institute: Institute;
	/** the number by which to offset the heading level */
	headingOffset?: number;
	/** optional tag to filter certs by */
	filterTag?: string | undefined;
}
