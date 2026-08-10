import type { BaseProps } from "../../types/props";
import type { LinkTag, MetaTag } from "../../types/tags";

interface LinkElementsProps {
	tag: "link";
	/** the attributes of the `<link>` tags to render */
	items: LinkTag[];
}

interface MetaElementsProps {
	tag: "meta";
	/** the attributes of the `<meta>` tags to render */
	items: MetaTag[];
}

export type ElementsProps = BaseProps & (LinkElementsProps | MetaElementsProps);
