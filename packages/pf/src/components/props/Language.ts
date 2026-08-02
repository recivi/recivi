import type { Language } from "@recivi/schema";

import type { BaseProps } from "./base";

export interface LanguageProps extends BaseProps {
	/** the language to render */
	language: Language;
}
