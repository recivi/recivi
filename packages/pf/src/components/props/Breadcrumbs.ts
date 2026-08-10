import type { BaseProps } from "../../types/props";
import type { AnchorProps } from "./Anchor";

export interface BreadcrumbsProps extends BaseProps {
	/** the list of anchors to the ancestors of the current page */
	crumbs: (AnchorProps | string)[];
}
