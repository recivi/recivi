import type { Epic } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface EpicDetailsProps extends BaseProps {
	/** the epic to render with all projects */
	epic: Epic;
	/** the number by which to offset the heading level */
	headingOffset?: number;
	/** optional tag to filter projects by */
	filterTag?: string | undefined;
}
