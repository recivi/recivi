/**
 * Collect all components from the code into a barrel types file.
 */

import { writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { styleText } from "node:util";

import { globSync } from "glob";

const srcPath = resolve(import.meta.filename, "../../");

function getComponentMapping(allFiles: string[]): Record<string, string> {
	return Object.fromEntries(
		allFiles
			.map((astroFile): [string, string] => {
				const componentName =
					astroFile
						.split("/")
						.at(-1)
						?.replace(/\.astro$/u, "") ?? "";
				const importPath = `.${astroFile.split("/src")[1]}`;
				return [
					componentName,
					`export const ${componentName}: typeof import("${importPath}").default;`,
				];
			})
			.toSorted(([a], [b]) => a.localeCompare(b)),
	);
}

const allCompFiles = globSync(`${srcPath}/components/defs/*.astro`);
const allCompExports = getComponentMapping(allCompFiles);
const barrelPath = join(srcPath, "components.d.ts");
const content = `declare module "virtual:pf/components" {
${Object.values(allCompExports)
	.map((line) => `\t${line}`)
	.join("\n")}
}
`;
writeFileSync(barrelPath, content, { encoding: "utf-8" });

console.log(
	styleText("green", "BRL"),
	styleText("bold", "src/index.ts"),
	styleText("green", `${Object.keys(allCompExports).length} components`),
);
console.log(styleText("green", "BRL"), "⚡️ Barrel success");
