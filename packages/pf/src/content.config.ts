/**
 * This file is not referenced anywhere and not imported anywhere. It exists
 * solely to define Astro content collections and silence TypeScript problems.
 */

import { defineCollection } from "astro:content";

import {
	getBlogLoader,
	blogSchema,
	getNowLoader,
	nowSchema,
	getPageLoader,
	pageSchema,
} from "./content";

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
