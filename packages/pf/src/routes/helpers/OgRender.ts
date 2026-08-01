import type { Org, Epic, Institute } from "@recivi/schema";
import { isInstitute, isOrg, isEpic } from "@recivi/schema/utils";
import config from "virtual:pf/config";

import { stripHtmlTags } from "../../utils/markup";
import type { OgRenderProps } from "../props/OgRender";

export function entityToOg(entity: Org | Epic | Institute, right: string) {
	const internalDest = isOrg(entity)
		? config.nav.dynamicPages.resumeOrg.replace("{slug}", entity.slug)
		: isEpic(entity)
			? config.nav.dynamicPages.resumeEpic.replace("{slug}", entity.slug)
			: isInstitute(entity)
				? config.nav.dynamicPages.resumeInstitute.replace("{slug}", entity.slug)
				: undefined;

	// Remove the icon for institutes as most don't have one.
	if (isInstitute(entity)) {
		entity = { ...entity, id: undefined };
	}

	return {
		params: {
			path: internalDest,
		},
		props: {
			// We use internal link to hide the ↗ arrow.
			title: { entity, useInternalLink: true },
			description: stripHtmlTags("description" in entity ? (entity.description ?? "") : ""),
			breadcrumbs: `Résumé`,
			right,
		} satisfies OgRenderProps,
	};
}
