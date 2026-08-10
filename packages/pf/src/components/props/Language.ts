import type { Language } from "@recivi/schema";

import type { BaseProps } from "../../types/props";

export interface LanguageProps extends BaseProps {
	/** the language to render */
	language: Language;
}
