import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";
import config from "virtual:pf/config";
import nav from "virtual:pf/nav";
import projectContext from "virtual:pf/project-context";
import resumeData from "virtual:recivi/data";

export const GET: APIRoute = async ({ site }) => {
	if (!site) {
		throw new Error("Cannot generate RSS unless `site` is configured.");
	}

	const title = config.title ?? resumeData.bio.name;
	const description = (await getEntry("pages", config.pages.blog.slug))?.data.description ?? "";

	const items = (await getCollection("blog")).map((post) => {
		const data = post.data;
		const slug = post.id.slice(5);
		return {
			title: data.title,
			description: data.description,
			pubDate: data.pubDate,
			link: nav.blogPost?.replace("{slug}", slug),
		};
	});

	return rss({
		site,
		title,
		description,
		items,
		trailingSlash: projectContext.trailingSlash !== "never",
	});
};
