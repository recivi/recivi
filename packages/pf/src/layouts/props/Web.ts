import type { MarkdownLayoutProps } from "astro";
import type { z } from "astro/zod";

import type { pageSchema } from "../../content";
import type { BaseProps } from "../../types/props";

type Frontmatter = z.infer<typeof pageSchema>;

export type WebProps = BaseProps | MarkdownLayoutProps<Frontmatter>;
