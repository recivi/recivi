/**
 * Convert Zod schema to a JSON Schema schema and place it in the docs.
 */

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { styleText } from "node:util";

import { z } from "zod";

// Import from the barrel file.
import { resumeSchema } from "@/index";
import { primaryRegistry } from "@/registries/primary";

console.log(styleText("blue", "ZTS"), "Zod to JSON Schema start");

const schemasDir = resolve(import.meta.filename, "../../../../../docs/public/schemas/");
rmSync(schemasDir, { recursive: true, force: true });
mkdirSync(schemasDir, { recursive: true });

const jsonSchema = z.toJSONSchema(resumeSchema, {
	metadata: primaryRegistry,
	reused: "inline",
	cycles: "ref",
	io: "input",
});
const content = JSON.stringify(jsonSchema, null, 2);
const schemaPath = join(schemasDir, "recivi-resume.json");
writeFileSync(schemaPath, content, { encoding: "utf-8" });
console.log(styleText("green", "ZTS"), styleText("bold", "recivi-resume.json"));

for (const [key] of Object.entries(jsonSchema.$defs ?? {})) {
	// Verify that no keys are anonymous. Anonymous keys are named with a
	// prefix "__schema".
	if (/^__schema\d+$/u.test(key)) {
		console.log(styleText("red", "ZTS"), `Anonymous schema definition found: ${key}`);
		console.log(styleText("red", "ZTS"), "⚡️ Zod to JSON Schema failed");
		process.exit(1);
	}
}

console.log(styleText("green", "ZTS"), "⚡️ Zod to JSON Schema success");
