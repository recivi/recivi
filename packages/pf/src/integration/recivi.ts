import type { AstroIntegration } from "astro";

import { type ParsedOptions } from "../options";
import { loadReciviData } from "../recivi/load";
import type { MutableVirtualImport } from "../vite/virtual_import";

type Hooks = AstroIntegration["hooks"];
type ConfigSetupParams = Parameters<NonNullable<Hooks["astro:config:setup"]>>[0];
type ServerSetupParams = Parameters<NonNullable<Hooks["astro:server:setup"]>>[0];

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
export async function reloadReciviData(
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
