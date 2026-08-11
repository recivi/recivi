import type { Institute, Org, Epic } from "@recivi/schema";
import { isInstitute, isOrg, isEpic } from "@recivi/schema/utils";
import nav from "virtual:pf/nav";
import projectContext from "virtual:pf/project-context";

import { getUrlFromPattern } from "./project_context";

/**
 * Get the URL of an index page.
 *
 * This refers to either the résumé index page or the blog index page.
 *
 * @param type the type of the index page for which to get the URL
 * @returns the URL of the index page
 */
export function getIndexUrl(type: "resume" | "blog"): string | undefined {
	let pattern: string | undefined;

	if (type === "resume" && nav.resumeIndex) {
		pattern = nav.resumeIndex;
	} else if (type === "blog" && nav.blogIndex) {
		pattern = nav.blogIndex;
	}

	return pattern ? getUrlFromPattern(projectContext, pattern) : undefined;
}

/**
 * Get the URL to a blog post's dynamic page by populating the slug.
 *
 * @param postSlug the slug of the blog post
 * @returns the URL of the blog post's dynamic page
 */
export function getBlogPostUrl(postSlug: string): string | undefined {
	let pattern: string | undefined;

	if (nav.blogPost) {
		pattern = nav.blogPost.replace("[postSlug]", postSlug);
	}

	return pattern ? getUrlFromPattern(projectContext, pattern) : undefined;
}

/**
 * Get the URL to a résumé entity's dynamic page by populating the slug.
 *
 * @param entity the subject of the dynamic page
 * @returns the URL of the résumé entity's dynamic page
 */
export function getResumeEntityUrl(entity: Institute | Org | Epic): string | undefined {
	let pattern: string | undefined;

	if (isInstitute(entity) && nav.resumeInstitute) {
		pattern = nav.resumeInstitute.replace("[instituteSlug]", entity.slug);
	} else if (isOrg(entity) && nav.resumeOrg) {
		pattern = nav.resumeOrg.replace("[orgSlug]", entity.slug);
	} else if (isEpic(entity) && nav.resumeEpic) {
		pattern = nav.resumeEpic.replace("[epicSlug]", entity.slug);
	}

	return pattern ? getUrlFromPattern(projectContext, pattern) : undefined;
}
