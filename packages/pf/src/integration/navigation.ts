import type { AstroIntegration } from "astro";

import type { MutableVirtualImport } from "../vite/virtual_import";

type Hooks = AstroIntegration["hooks"];
type RoutesResolvedParams = Parameters<NonNullable<Hooks["astro:routes:resolved"]>>[0];
type ResolvedRoute = Pick<RoutesResolvedParams["routes"][number], "params" | "pattern">;

/** Derive PF navigation information from the routes registered with Astro. */
export function resolvePfNav(routes: readonly ResolvedRoute[]) {
	const allPatterns = new Set(routes.map((route) => route.pattern));
	const findRoute = (slugName: string): string | undefined =>
		routes.find((route) => route.params.includes(slugName))?.pattern;
	const findIndex = (pattern: string | undefined): string | undefined => {
		if (!pattern) return undefined;

		let currentPattern = pattern;
		do {
			currentPattern = currentPattern.replace(/\/[^/]+$/u, "");
			if (allPatterns.has(currentPattern)) return currentPattern;
		} while (currentPattern !== "");

		return undefined;
	};

	const blogPost = findRoute("postSlug");
	const resumeEpic = findRoute("epicSlug");
	const resumeOrg = findRoute("orgSlug");
	const resumeInstitute = findRoute("instituteSlug");

	return {
		blogPost,
		resumeEpic,
		resumeOrg,
		resumeInstitute,
		blogIndex: findIndex(blogPost),
		resumeIndex: findIndex(resumeOrg ?? resumeEpic ?? resumeInstitute),
	};
}

/** Update the PF navigation virtual module after Astro resolves project routes. */
export function reloadPfNav(
	params: RoutesResolvedParams,
	virtualPfNav: MutableVirtualImport,
): void {
	virtualPfNav.update(`export default ${JSON.stringify(resolvePfNav(params.routes))}`);
}
