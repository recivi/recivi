import type { Org, Epic, Institute } from "@recivi/schema";
import { isInstitute } from "@recivi/schema/utils";
import projectContext from "virtual:pf/project-context";

import { getResumeEntityUrl } from "../../utils/dynamic_pages";
import { stripHtmlTags } from "../../utils/markup";
import { unprefixBase } from "../../utils/project_context";
import type { OgRenderProps } from "../props/OgRender";

export function entityToOg(entity: Org | Epic | Institute, right: string) {
	const internalDest = getResumeEntityUrl(entity);
	if (!internalDest) {
		return;
	}

	// Remove the icon for institutes as most don't have one.
	if (isInstitute(entity)) {
		entity = { ...entity, id: undefined };
	}

	return {
		params: {
			path: unprefixBase(projectContext, internalDest),
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
