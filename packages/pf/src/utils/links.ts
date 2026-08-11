import config from "virtual:pf/config";
import projectContext from "virtual:pf/project-context";

import type { LinkTag } from "../types/tags";
import { prefixBase, publicFileExists } from "./project_context";

/**
 * Get a list of `<link>` tag attribute objects for icons.
 *
 * @returns the list of `<link>` tag attribute objects
 */
export async function getIconLinkTags(): Promise<LinkTag[]> {
	const tags: LinkTag[] = [];

	if (!config.favicon.isEnabled) return tags;

	if (await publicFileExists(projectContext, "favicon.ico")) {
		tags.push({
			rel: "icon",
			href: prefixBase(projectContext, "favicon.ico"),
			sizes: "32x32",
		});
	}

	const { faviconSvg, appleTouchIcon } = config.favicon.fileNames;
	if (await publicFileExists(projectContext, faviconSvg)) {
		tags.push({
			rel: "icon",
			href: prefixBase(projectContext, faviconSvg),
			type: "image/svg+xml",
		});
	}
	if (await publicFileExists(projectContext, appleTouchIcon)) {
		tags.push({
			rel: "apple-touch-icon",
			href: prefixBase(projectContext, appleTouchIcon),
		});
	}

	if (projectContext.hasManifestIcons) {
		tags.push({
			rel: "manifest",
			href: prefixBase(projectContext, "manifest.webmanifest"),
		});
	}

	return tags;
}
