/**
 * Collect all types and schemas from the code into a barrel file.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { styleText } from "node:util";

import { globSync } from "glob";

const EXPORT_TYPE_RE = /export (?:interface|type) (?<name>\w+)/u;
const EXPORT_ZOD_RE = /export const (?<name>\w+Schema)/u;
const EXPORT_CONST_RE = /export const (?<name>[A-Z_]+)/u;

const srcPath = resolve(import.meta.filename, "../../");

console.log(styleText("blue", "BRL"), "Barrel start");

const allTsFiles = globSync(`${srcPath}/models/**/*.ts`);
let typesCount = 0;
let schemasCount = 0;

const fileExports = allTsFiles.flatMap((tsFile) => {
	const code = readFileSync(tsFile, { encoding: "utf-8" });
	const importPath = `@${tsFile.split(/schema\/src/u)[1].replace(/\.ts$/u, "")}`;
	const lines = code.split("\n");

	const constants = lines
		.map((line) => EXPORT_CONST_RE.exec(line)?.groups?.name)
		.filter((val) => val !== undefined)
		.map((name) => `export { ${name} } from '${importPath}'`);

	const types = lines
		.map((line) => EXPORT_TYPE_RE.exec(line)?.groups?.name)
		.filter((val) => val !== undefined)
		.map((name) => `export type { ${name} } from '${importPath}'`);
	typesCount += types.length;

	const schemas = lines
		.map((line) => EXPORT_ZOD_RE.exec(line)?.groups?.name)
		.filter((val) => val !== undefined)
		.map((name) => `export { ${name} } from '${importPath}'`);
	schemasCount += schemas.length;

	return constants.concat(types).concat(schemas);
});

const barrelPath = join(srcPath, "index.ts");
writeFileSync(barrelPath, fileExports.join("\n"), { encoding: "utf-8" });

console.log(
	styleText("green", "BRL"),
	styleText("bold", "src/index.ts"),
	styleText("green", `${typesCount} types`),
);
console.log(
	styleText("green", "BRL"),
	styleText("bold", "src/index.ts"),
	styleText("green", `${schemasCount} schemas`),
);
console.log(styleText("green", "BRL"), "⚡️ Barrel success");
