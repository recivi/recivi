import type { Institute, Org, Epic } from "@recivi/schema";
import { isInstitute, isOrg, isEpic } from "@recivi/schema/utils";
import nav from "virtual:pf/nav";
import projectContext from "virtual:pf/project-context";

import { getUrlFromPattern } from "./project_context";

/**
 * Get the URL to a blog post's dynamic page by populating the slug.
 *
 * @param postSlug the slug of the blog post
 * @returns the URL of the blog post's dynamic page
 */
export function getBlogPostUrl(postSlug: string): string | undefined {
	let pattern: string | undefined;

	if (nav.blog.post.pattern) {
		pattern = nav.blog.post.pattern.replace("[postSlug]", postSlug);
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

	if (isInstitute(entity) && nav.resume.institute.pattern) {
		pattern = nav.resume.institute.pattern.replace("[instituteSlug]", entity.slug);
	} else if (isOrg(entity) && nav.resume.org.pattern) {
		pattern = nav.resume.org.pattern.replace("[orgSlug]", entity.slug);
	} else if (isEpic(entity) && nav.resume.epic.pattern) {
		pattern = nav.resume.epic.pattern.replace("[epicSlug]", entity.slug);
	}

	return pattern ? getUrlFromPattern(projectContext, pattern) : undefined;
}
