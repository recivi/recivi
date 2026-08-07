import {
	blogLoader,
	blogSchema,
	nowLoader,
	nowSchema,
	pageLoader,
	pageSchema,
} from "@recivi/pf/content";
import { defineCollection } from "astro:content";

const now = defineCollection({
	loader: nowLoader(),
	schema: nowSchema,
});
const blog = defineCollection({
	loader: blogLoader(),
	schema: blogSchema,
});
const pages = defineCollection({
	loader: pageLoader(),
	schema: pageSchema,
});

export const collections = { now, blog, pages };
