import type { AstroIntegration } from "astro";

import type { MutableVirtualImport } from "../vite/virtual_import";

type Hooks = AstroIntegration["hooks"];
type RoutesResolvedParams = Parameters<NonNullable<Hooks["astro:routes:resolved"]>>[0];
type ResolvedRoute = Pick<
	RoutesResolvedParams["routes"][number],
	"entrypoint" | "params" | "pattern"
>;

/** Derive PF navigation information from the routes registered with Astro. */
export function resolvePfNav(routes: readonly ResolvedRoute[]) {
	const routesByPattern = new Map(routes.map((route) => [route.pattern, route]));

	const findRoute = (slugName: string): ResolvedRoute | undefined =>
		routes.find((route) => route.params.includes(slugName));

	const findIndex = (route: ResolvedRoute | undefined): ResolvedRoute | undefined => {
		if (!route) return undefined;

		let currentPattern = route.pattern;
		do {
			currentPattern = currentPattern.replace(/\/[^/]+$/u, "");
			const indexRoute = routesByPattern.get(currentPattern);
			if (indexRoute) return indexRoute;
		} while (currentPattern !== "");

		return undefined;
	};

	const blogPostRoute = findRoute("postSlug");
	const resumeEpicRoute = findRoute("epicSlug");
	const resumeOrgRoute = findRoute("orgSlug");
	const resumeInstituteRoute = findRoute("instituteSlug");

	const blogIndexRoute = findIndex(blogPostRoute);
	const resumeIndexRoute = findIndex(resumeOrgRoute ?? resumeEpicRoute ?? resumeInstituteRoute);

	return {
		blog: {
			index: blogIndexRoute
				? { pattern: blogIndexRoute.pattern, entrypoint: blogIndexRoute.entrypoint }
				: undefined,
			post: { pattern: blogPostRoute?.pattern },
		},
		resume: {
			index: resumeIndexRoute
				? { pattern: resumeIndexRoute.pattern, entrypoint: resumeIndexRoute.entrypoint }
				: undefined,
			epic: { pattern: resumeEpicRoute?.pattern },
			org: { pattern: resumeOrgRoute?.pattern },
			institute: { pattern: resumeInstituteRoute?.pattern },
		},
	};
}

export type PfNav = ReturnType<typeof resolvePfNav>;

/** Update the PF navigation virtual module after Astro resolves project routes. */
export function reloadPfNav(
	params: RoutesResolvedParams,
	virtualPfNav: MutableVirtualImport,
): void {
	virtualPfNav.update(`export default ${JSON.stringify(resolvePfNav(params.routes))}`);
}
