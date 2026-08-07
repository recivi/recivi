import { z } from "astro/zod";

import { primaryRegistry } from "../registries/primary";

const nowSchema = z
	.object({
		/** number of entries to show on the "Now" page */
		numEntries: z.number().optional().default(3).register(primaryRegistry, {
			description: 'number of entries to show on the "Now" page',
		}),

		/** the URL at which older "Now" updates can be found */
		archiveUrl: z.string().optional().register(primaryRegistry, {
			description: 'the URL at which older "Now" updates can be found',
		}),
	})
	.register(primaryRegistry, {
		id: "now",
		description: 'the settings for the "Now" page',
	});

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
		/** the settings for the "Now" page */
		now: nowSchema.optional().prefault({}).register(primaryRegistry, {
			description: 'the settings for the "Now" page',
		}),

		/** the settings for the "Blog" page */
		blog: blogSchema.optional().prefault({}).register(primaryRegistry, {
			description: 'the settings for the "Blog" page',
		}),
	})
	.register(primaryRegistry, {
		id: "pages",
		description: "the settings for the included pages",
	});
