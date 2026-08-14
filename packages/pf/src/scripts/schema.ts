/**
 * Convert the root Zod schema to JSON Schema and place it in the docs.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { styleText } from "node:util";

import { z } from "astro/zod";

import { optionsSchema as rootSchema } from "../options/index";
import { primaryRegistry } from "../registries/primary";

console.log(styleText("blue", "ZTS"), "Zod to JSON Schema start");

const schemasDir = resolve(import.meta.filename, "../../../../../docs/public/schemas/");
mkdirSync(schemasDir, { recursive: true });

const jsonSchema = z.toJSONSchema(rootSchema, {
	metadata: primaryRegistry,
	reused: "inline",
	cycles: "ref",
	io: "input",
	override: ({ jsonSchema: generatedSchema }) => {
		delete generatedSchema.id;
	},
});
const fileName = "recivi-options.json";
jsonSchema.$id = `https://recivi.pages.dev/schemas/${fileName}`;

for (const [key] of Object.entries(jsonSchema.$defs ?? {})) {
	// Verify that no keys are anonymous. Anonymous keys are named with a
	// prefix "__schema".
	if (/^__schema\d+$/u.test(key)) {
		console.log(styleText("red", "ZTS"), `Anonymous schema definition found: ${key}`);
		console.log(styleText("red", "ZTS"), "⚡️ Zod to JSON Schema failed");
		process.exit(1);
	}
}

const content = JSON.stringify(jsonSchema, null, 2);
writeFileSync(join(schemasDir, fileName), content, { encoding: "utf-8" });
console.log(styleText("green", "ZTS"), styleText("bold", fileName));

console.log(styleText("green", "ZTS"), "⚡️ Zod to JSON Schema success");
