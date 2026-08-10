/*
 * These functions do not import `projectContext` from virtual modules because
 * they are used in `index.ts` before the virtual modules have been defined.
 */

import { stat } from "node:fs/promises";
import { join } from "node:path";

import type { ProjectContext } from "../types/project_context";

/**
 * Check if a file exists in the public directory.
 *
 * @param projectContext settings of the Astro project beyond PF's config
 * @param filename the name of the file to check for existence
 * @returns whether the file exists in the public directory
 */
export async function publicFileExists(
	projectContext: Pick<ProjectContext, "publicDir">,
	filename: string,
): Promise<boolean> {
	try {
		await stat(join(projectContext.publicDir, filename));
		return true;
	} catch {
		return false;
	}
}

/**
 * Remove the `base` path as the prefix from the given path.
 *
 * This function returns the remaining path with a leading slash.
 *
 * @param projectContext settings of the Astro project beyond PF's config
 * @param path the path from which `base` is to be removed
 * @returns the path with `base` removed
 */
export function unprefixBase(projectContext: Pick<ProjectContext, "base">, path: string): string {
	const { base } = projectContext;
	const baseWithTrailing = base.endsWith("/") ? base : `${base}/`;
	if (!path.startsWith(baseWithTrailing)) {
		throw new Error(`Path "${path}" does not start with base "${baseWithTrailing}"`);
	}
	const remaining = path.slice(baseWithTrailing.length);
	return remaining.startsWith("/") ? remaining : `/${remaining}`;
}

/**
 * Add the `base` path as a prefix to the given path.
 *
 * This function handles the case where `base` has a trailing slash and the path
 * has a leading slash.
 *
 * @param projectContext settings of the Astro project beyond PF's config
 * @param path the path to which `base` is to be added
 * @returns the path with `base` added
 */
export function prefixBase(projectContext: Pick<ProjectContext, "base">, path: string): string {
	const { base } = projectContext;
	const baseNoTrailing = base.endsWith("/") ? base.slice(0, -1) : base;
	const pathNoLeading = path.startsWith("/") ? path.slice(1) : path;
	return `${baseNoTrailing}/${pathNoLeading}`;
}

/**
 * Normalize the trailing slash based on the `trailingSlash` setting.
 *
 * - If `trailingSlash` is 'always', ensure the path ends with a slash.
 * - If `trailingSlash` is 'never', ensure the path does not end with a slash.
 * - If `trailingSlash` is 'ignore', leave the path unchanged.
 *
 * It is possible to get the same path back if it is already normalised.
 *
 * @param projectContext settings of the Astro project beyond PF's config
 * @param path the path whose trailing slash needs to be fixed
 * @returns the path with the correct trailing slash
 */
export function normalizeSlash(
	projectContext: Pick<ProjectContext, "trailingSlash">,
	path: string,
): string {
	const { trailingSlash } = projectContext;

	if (trailingSlash === "always" && !path.endsWith("/")) {
		return `${path}/`;
	}
	if (trailingSlash === "never" && path.endsWith("/")) {
		return path.slice(0, -1);
	}
	return path;
}
