import { z } from "astro/zod";

import { primaryRegistry } from "../registries/primary";

const blogSchema = z
	.object({
		/** whether to show the category filter on the blog index page; This requires JavaScript. */
		showCategories: z.boolean().optional().default(true).register(primaryRegistry, {
			description:
				"whether to show the category filter on the blog index page; This requires JavaScript.",
		}),
		/** the slug of the blog index page; This is used to populate the RSS description correctly when the blog is served at a custom URL. */
		slug: z.string().optional().default("blog").register(primaryRegistry, {
			description:
				"the slug of the blog index page; This is used to populate the RSS description correctly when the blog is served at a custom URL.",
		}),
	})
	.register(primaryRegistry, {
		id: "blog",
		description: 'the settings for the "Blog" page',
	});

export const pagesSchema = z
	.object({
		/** the settings for the "Blog" page */
		blog: blogSchema.optional().prefault({}).register(primaryRegistry, {
			description: 'the settings for the "Blog" page',
		}),
	})
	.register(primaryRegistry, {
		id: "pages",
		description: "the settings for the included pages",
	});
