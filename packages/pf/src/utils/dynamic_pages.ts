import type { Institute, Org, Epic } from "@recivi/schema";
import { isInstitute, isOrg, isEpic } from "@recivi/schema/utils";
import nav from "virtual:pf/nav";

/**
 * Get the URL to an entity's dynamic page by populating the slug placeholder.
 *
 * @param entity the subject of the dynamic page
 * @returns the URL of the dynamic page
 */
export function getDynamicPage(entity: Institute | Org | Epic): string | undefined {
	if (isInstitute(entity) && nav.resumeInstitute) {
		return nav.resumeInstitute.replace("[instituteSlug]", entity.slug);
	} else if (isOrg(entity) && nav.resumeOrg) {
		return nav.resumeOrg.replace("[orgSlug]", entity.slug);
	} else if (isEpic(entity) && nav.resumeEpic) {
		return nav.resumeEpic.replace("[epicSlug]", entity.slug);
	}
	return undefined;
}
