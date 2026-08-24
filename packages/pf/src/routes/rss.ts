import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import config from "virtual:pf/config";
import nav from "virtual:pf/nav";
import resumeData from "virtual:recivi/data";

import { getPageByEntrypoint } from "../utils/collections";
import { getBlogPostUrl } from "../utils/dynamic_pages";

export const GET: APIRoute = async ({ site }) => {
	if (!site) {
		throw new Error("Cannot generate RSS unless `site` is configured.");
	}

	const title = config.title ?? resumeData.bio.name;
	const indexPage = await getPageByEntrypoint(nav.blog.index?.entrypoint);
	const description = indexPage?.data.description ?? "";

	const items = (await getCollection("blog")).map((post) => {
		const data = post.data;
		const slug = post.id.slice(5);
		return {
			title: data.title,
			description: data.description,
			pubDate: data.pubDate,
			link: getBlogPostUrl(slug),
		};
	});

	return rss({
		site,
		title,
		description,
		items,
	});
};
