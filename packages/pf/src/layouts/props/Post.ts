import type { MarkdownHeading } from "astro";
import { z } from "astro/zod";

import { blogSchema } from "../../content";
import type { BaseProps } from "../../types/props";

export interface PostProps extends BaseProps {
	/** the list of headings to render in the ToC */
	postData: z.infer<typeof blogSchema>;
	/** the list of headings to render in the ToC */
	headings: MarkdownHeading[];
}
