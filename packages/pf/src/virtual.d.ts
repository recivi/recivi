/*
 * This file contains TypeScript types for virtual modules provided by
 * the Récivi PF Astro integration. The contents of these modules are
 * defined in the `index.ts` file.
 */

declare module "virtual:pf/config" {
	const Options: import("./options").ParsedOptions;
	export default Options;
}

declare module "virtual:recivi/data" {
	const Resume: import("@recivi/schema").Resume;
	export default Resume;
}

declare module "virtual:pf/project-context" {
	const Context: import("./types/project_context").ProjectContext;
	export default Context;
}

declare module "virtual:pf/custom-css/*" {
	const css: string;
	export default css;
}
