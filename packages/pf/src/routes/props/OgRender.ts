import type { EntityProps } from "../../components/props/Entity.ts";

export interface OgRenderProps {
	/** the title of the page, appears as the most prominent item */
	title: EntityProps | string;
	/** the description of the page */
	description: string;
	/**
	 * the breadcrumb trail of the page, suffixed to site title with a slash `/`
	 * as the separator
	 */
	breadcrumbs?: string;
	/** the text to show on the right side of the header */
	right?: string | Promise<string>;
}
