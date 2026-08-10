import type { CollectionEntry } from "astro:content";

import type { BaseProps } from "../../types/props";

export interface NowUpdateProps extends BaseProps {
	/** the update entry to render */
	update: CollectionEntry<"now">;
	/** whether this is the latest update from the user */
	isLatest: boolean;
}
