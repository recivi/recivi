import {
	getBlogLoader,
	blogSchema,
	getNowLoader,
	nowSchema,
	getPageLoader,
	pageSchema,
} from "@recivi/pf/content";
import { defineCollection } from "astro:content";

const now = defineCollection({
	loader: getNowLoader(),
	schema: nowSchema,
});
const blog = defineCollection({
	loader: getBlogLoader(),
	schema: blogSchema,
});
const pages = defineCollection({
	loader: getPageLoader(),
	schema: pageSchema,
});

export const collections = { now, blog, pages };
