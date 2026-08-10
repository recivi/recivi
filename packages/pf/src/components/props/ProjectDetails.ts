import type { Project } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface ProjectDetailsProps extends BaseProps {
	/** the project to render */
	project: Project;
	/** the number by which to offset the heading level */
	headingOffset?: number;
}
