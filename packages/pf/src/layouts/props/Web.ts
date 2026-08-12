import type { z } from "astro/zod";

import type { pageSchema } from "../../content";
import type { BaseProps, Clsx } from "../../types/props";

type Frontmatter = z.infer<typeof pageSchema>;

export interface WebProps extends BaseProps {
	/** frontmatter for MDX page, derived from PF's `pageSchema` */
	frontmatter: Frontmatter;
	/** classes to apply to the `<main>` tag */
	mainClass?: Clsx;
}
