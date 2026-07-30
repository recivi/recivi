import type { Plugin } from "vite";

export interface MutableVirtualImport {
	id: string;
	plugin: Plugin;
	update(code: string): void;
}

function createVirtualImportPlugin(baseName: string, getCode: () => string) {
	const name = `virtual:${baseName}`;
	const id = `\0${name}`;
	return {
		id,
		plugin: {
			name,
			resolveId: {
				filter: { id: new RegExp(`^${name}$`, "u") },
				handler() {
					return id;
				},
			},
			load: {
				filter: {
					id: new RegExp(`^${id}$`, "u"),
				},
				handler() {
					return getCode();
				},
			},
		},
	} satisfies { id: string; plugin: Plugin };
}

/**
 * Create a Vite plugin that provides a virtual module with the given code.
 *
 * This code can be updated later by calling the `update` method on the returned
 * object.
 *
 * @param baseName the unprefixed name used to refer to the module
 * @param initialCode the code present in the virtual module at init
 * @returns an object containing the plugin and a method to update the code
 */
export function getVirtualImport(baseName: string, initialCode: string): MutableVirtualImport {
	let code = initialCode;
	const { id, plugin } = createVirtualImportPlugin(baseName, () => code);
	return {
		id,
		plugin,
		update(newCode) {
			code = newCode;
		},
	};
}
