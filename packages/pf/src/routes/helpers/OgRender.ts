import type { Org, Epic, Institute } from "@recivi/schema";
import config from "virtual:pf/config";

import { stripHtmlTags } from "../../utils/markup";
import type { OgRenderProps } from "../props/OgRender";

export function entityToOg(entity: Org | Epic | Institute, right: string) {
	const internalDest =
		"roles" in entity
			? config.nav.dynamicPages.resumeOrg.replace("{slug}", entity.slug)
			: "projects" in entity
				? config.nav.dynamicPages.resumeEpic.replace("{slug}", entity.slug)
				: "certs" in entity
					? config.nav.dynamicPages.resumeInstitute.replace("{slug}", entity.slug)
					: undefined;

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
