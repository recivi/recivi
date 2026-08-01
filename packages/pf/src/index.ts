// This triple-slash directive defines dependencies to various declaration files that
// will be loaded when a user imports the PF integration in their Astro project.
// Directives can only be present at the top of a file and can only be preceded by other
// directives or comments.
//
// oxlint-disable typescript/triple-slash-reference
/// <reference path="./virtual.d.ts"/>
/// <reference path="./components.d.ts"/>

import { fileURLToPath } from "node:url";
import { styleText } from "node:util";

import mdx from "@astrojs/mdx";
import type { AstroIntegration } from "astro";

import { componentNames } from "./components/index";
import { generateOg } from "./jobs/generate_og";
import { generatePdf } from "./jobs/generate_pdf";
import { type Options, optionsSchema, type ParsedOptions } from "./options";
import { layoutNames } from "./options/css";
import { loadReciviData } from "./recivi/load";
import { satteriProcessor } from "./satteri/default_layout";
import type { ProjectContext } from "./types/project_context";
import { debounce } from "./utils/debounce";
import { getAbsolutePath, isLocalFile } from "./utils/paths";
import { publicFileExists } from "./utils/project_context";
import { getVirtualImport, type MutableVirtualImport } from "./vite/virtual_import";

type Hooks = AstroIntegration["hooks"];
type ConfigSetupParams = Parameters<NonNullable<Hooks["astro:config:setup"]>>[0];
type ServerSetupParams = Parameters<NonNullable<Hooks["astro:server:setup"]>>[0];
type RoutesResolvedParams = Parameters<NonNullable<Hooks["astro:routes:resolved"]>>[0];

/**
 * Resolve some options that use relative paths to their absolute paths.
 *
 * These paths are resolved relative to the Astro config file. The changes are
 * made in-place to the passed `options` object.
 *
 * @param options the parsed options in which to resolve relative paths
 * @param configRoot the root directory of the Astro config file
 */
function resolveOptions(options: ParsedOptions, configRoot: URL) {
	options.reciviDataFile = options.reciviDataFile.startsWith(".")
		? getAbsolutePath(options.reciviDataFile, configRoot)
		: options.reciviDataFile;

	for (const layoutName of layoutNames) {
		options.css.customCss[layoutName] = options.css.customCss[layoutName].map((file) =>
			file.startsWith(".") ? getAbsolutePath(file, configRoot) : file,
		);
	}

	for (const componentName of componentNames) {
		const name = options.components[componentName];
		options.components[componentName] = name.startsWith(".")
			? getAbsolutePath(name, configRoot)
			: name;
	}
}

/**
 * Collect information about the Astro project and return a project context object.
 *
 * @param params the parameters provided by the Astro integration hook
 * @param options the parsed options for the integration
 * @returns a project context object containing information about the Astro project
 */
async function createProjectContext(
	params: ConfigSetupParams,
	options: ParsedOptions,
): Promise<ProjectContext> {
	const { site, base, trailingSlash } = params.config;
	const publicDir = fileURLToPath(params.config.publicDir);
	const prefix = options.favicon.fileNames.manifestIconsPrefix;
	const iconChecks = [192, 512].map((size) =>
		publicFileExists({ publicDir }, `${prefix}${size}.png`),
	);
	const hasManifestIcons = (await Promise.all(iconChecks)).some(Boolean);
	return { site, base, trailingSlash, publicDir, hasManifestIcons };
}

/**
 * Set up virtual imports for the project.
 *
 * @param params the parameters provided by the Astro integration hook
 * @param options the parsed options for the integration
 * @param projectContext the project context
 * @returns a record of virtual imports
 */
function setVirtualImports(
	params: ConfigSetupParams,
	options: ParsedOptions,
	projectContext: ProjectContext,
): Record<string, MutableVirtualImport> {
	const imports = {
		"pf/config": `export default ${JSON.stringify(options)}`,
		"pf/project-context": `export default ${JSON.stringify(projectContext)}`,

		// Navigation info is determined during route resolution.
		"pf/nav": `export default {}`,

		// Récivi data is loaded later and updated.
		"recivi/data": `export default {}`,

		"pf/components": Object.entries(options.components)
			.map(([name, path]) => `export { default as ${name} } from '${path}';`)
			.join("\n"),
		...Object.fromEntries(
			layoutNames.map((layoutName) => [
				`pf/custom-css/${layoutName}`,
				options.css.customCss[layoutName].map((file) => `import '${file}';`).join("\n"),
			]),
		),
	};
	const virtualImports = Object.fromEntries(
		Object.entries(imports).map(([name, code]) => [name, getVirtualImport(name, code)]),
	);

	params.updateConfig({
		vite: {
			plugins: Object.values(virtualImports).map(({ plugin }) => plugin),
		},
	});

	return virtualImports;
}

/**
 * Inject custom endpoints into the Astro project.
 *
 * @param params the parameters provided by the Astro integration hook
 * @param options the parsed options for the integration
 * @param projectContext the project context
 */
function injectRoutes(
	params: ConfigSetupParams,
	options: ParsedOptions,
	projectContext: ProjectContext,
) {
	if (projectContext.site) {
		params.injectRoute({
			pattern: "og/[...path].png",
			entrypoint: "@recivi/pf/routes/defs/OgRender.astro",
		});
		params.injectRoute({ pattern: "rss.xml", entrypoint: "@recivi/pf/routes/rss.ts" });
	}
	if (options.favicon.isEnabled && projectContext.hasManifestIcons) {
		params.injectRoute({
			pattern: "manifest.webmanifest",
			entrypoint: "@recivi/pf/routes/manifest.ts",
		});
	}
}

/**
 * Configure Markdown processing for the project.
 *
 * @param params the parameters provided by the Astro integration hook
 */
function configureMarkdown(params: ConfigSetupParams) {
	params.updateConfig({
		markdown: {
			shikiConfig: {
				themes: {
					light: "catppuccin-latte",
					dark: "catppuccin-mocha",
				},
			},
			processor: satteriProcessor,
		},
		integrations: [mdx({ optimize: true })],
	});
}

/**
 * Configure the Astro project with the given options.
 *
 * This is part of the `astro:config:setup` hook.
 *
 * @param params the parameters provided by the Astro integration hook
 * @param options the parsed options for the integration
 * @returns an object containing the project context and virtual imports
 */
async function configureAstro(params: ConfigSetupParams, options: ParsedOptions) {
	resolveOptions(options, params.config.root);
	// The `options` have now been mutated to contain absolute paths.

	const projectContext = await createProjectContext(params, options);
	const virtualImports = setVirtualImports(params, options, projectContext);
	injectRoutes(params, options, projectContext);
	configureMarkdown(params);

	return { projectContext, virtualImports };
}

/**
 * Reload the Récivi data file, update the associated virtual module and trigger
 * a full page reload in the Astro dev server.
 *
 * This is used by hooks `astro:config:setup` and `astro:server:setup`.
 *
 * @param params the parameters provided by the Astro integration hook
 * @param options the parsed options for the integration
 * @param reciviDataPlugin the virtual import plugin for the Récivi data module
 */
async function reloadReciviData(
	params: ServerSetupParams | ConfigSetupParams,
	options: ParsedOptions,
	reciviDataPlugin: MutableVirtualImport,
) {
	const reciviData = await loadReciviData(options.reciviDataFile);
	reciviDataPlugin.update(`export default ${JSON.stringify(reciviData)}`);

	if ("server" in params) {
		const module = params.server.moduleGraph.getModuleById(reciviDataPlugin.id);
		if (module) {
			params.server.moduleGraph.invalidateModule(module);
		}
		params.server.hot.send({ type: "full-reload" });
	}
}

/**
 * Identify the dynamic routes for blog posts and resume subpages, and update
 * the associated virtual module.
 *
 * @param params the parameters provided by the Astro integration hook
 * @param virtualPfNav the virtual import plugin for the PF navigation module
 */
function reloadPfNav(params: RoutesResolvedParams, virtualPfNav: MutableVirtualImport) {
	const findRoute = (slugName: string) =>
		params.routes.find((route) => route.params.includes(slugName))?.pattern;

	const navInfo = {
		blogPost: findRoute("postSlug"),
		resumeEpic: findRoute("epicSlug"),
		resumeOrg: findRoute("orgSlug"),
		resumeInstitute: findRoute("instituteSlug"),
	};
	virtualPfNav.update(`export default ${JSON.stringify(navInfo)}`);
}

function createHooks(options: ParsedOptions): AstroIntegration["hooks"] {
	let projectContext: ProjectContext;
	let virtualImports: Record<string, MutableVirtualImport>;
	let isWatchingDatafile = false;

	return {
		"astro:config:setup": async (params) => {
			params.logger.debug(`${styleText("blue", "astro:config:setup")} hook called`);

			({ projectContext, virtualImports } = await configureAstro(params, options));

			const vReciviData = virtualImports["recivi/data"];
			if (vReciviData) reloadReciviData(params, options, vReciviData);
		},
		"astro:routes:resolved": (params) => {
			const vPfNav = virtualImports["pf/nav"];
			if (vPfNav) reloadPfNav(params, vPfNav);
		},
		"astro:server:setup": (params) => {
			params.logger.debug(`${styleText("blue", "astro:server:setup")} hook called`);

			const vReciviData = virtualImports["recivi/data"];
			if (vReciviData && isLocalFile(options.reciviDataFile) && !isWatchingDatafile) {
				/** the 1s debounced version of `reloadReciviData` */
				const reloadData = debounce(() => reloadReciviData(params, options, vReciviData), 1000);
				params.server.watcher.add(options.reciviDataFile);
				params.server.watcher.on("change", (path) => {
					if (path === options.reciviDataFile) reloadData();
				});
				isWatchingDatafile = true;
			}
		},
		"astro:build:done": async (params) => {
			params.logger.debug(`${styleText("blue", "astro:build:done")} hook called`);

			const dirPath = fileURLToPath(params.dir);
			if (projectContext.site)
				await generateOg(projectContext, dirPath, params.pages, params.logger);
			await generatePdf(projectContext, dirPath, params.pages, params.logger);
		},
	};
}

/**
 * Set up the Récivi PF Astro integration with the given configuration.
 *
 * @param options the configuration options for the integration
 * @returns the configured instance of the Astro integration
 */
export default function (options: Options): AstroIntegration {
	const parsedOptions: ParsedOptions = optionsSchema.parse(options);
	return {
		name: "@recivi/pf",
		hooks: createHooks(parsedOptions),
	};
}
