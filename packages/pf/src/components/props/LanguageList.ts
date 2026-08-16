import type { LanguageProficiency } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface LanguageListProps extends BaseProps {
	/** the level below which the language should not be rendered */
	cutoffProficiency?: LanguageProficiency;
	/** whether to include languages without an overall proficiency */
	includesAmbiguous?: boolean;
}
