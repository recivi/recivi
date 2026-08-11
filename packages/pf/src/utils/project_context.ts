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
 * Convert the given ID of a page to its corresponding URL.
 *
 * The page ID represents the name of the page file on the filesystem without
 * the extension. It also resolves index files to the name of the parent directory,
 * except the root index file which has the ID "index".
 *
 * @param projectContext settings of the Astro project beyond PF's config
 * @param pageId the ID of the page to map to a URL
 * @returns the URL corresponding to the page ID
 */
export function getUrlFromSlug(
	projectContext: Pick<ProjectContext, "base" | "trailingSlash" | "build">,
	pageId: string,
): string {
	const {
		build: { format: buildFormat },
	} = projectContext;

	const path =
		pageId === "index" ? "/" : buildFormat === "file" ? `/${pageId}.html` : `/${pageId}/`;
	return prefixBase(projectContext, path);
}

/**
 * Convert a route pattern to its corresponding URL.
 *
 * For every route, Astro constructs a route with a pattern that looks like
 * `/` or `/fragment` or `/fragment/fragment/[param]`. We keep the patterns for
 * résumé index, résumé entities, blog index and blog posts to generate dynamic
 * pages.
 *
 * @param projectContext settings of the Astro project beyond PF's config
 * @param pattern the route pattern to map to a URL
 * @returns the URL corresponding to the route pattern
 */
export function getUrlFromPattern(
	projectContext: Pick<ProjectContext, "base" | "trailingSlash" | "build">,
	pattern: string,
): string {
	const {
		build: { format: buildFormat },
	} = projectContext;

	const path = buildFormat === "file" ? `${pattern}.html` : `${pattern}/`;
	return prefixBase(projectContext, path);
}
