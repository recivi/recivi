/**
 * Convert Zod schema to reference pages and place them in the docs.
 *
 * Also see the `reference.ts` script in the `packages/pf` package.
 */

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { styleText } from "node:util";

import { z } from "zod";

// Import from the barrel file.
import { resumeSchema } from "@/index";
import { primaryRegistry } from "@/registries/primary";

interface JsonSchema {
	id: string;
	description?: string;
}

function generateMarkdownPage(schema: JsonSchema): void {
	const filePath = join(referenceDir, `${schema.id.toLocaleLowerCase()}.mdx`);
	const content = `---
title: ${schema.id}
description: ${schema.description ?? "undefined"}
tableOfContents: false
---

import Schema from '@/components/Schema.astro'

<Schema
  schemaString='${Buffer.from(JSON.stringify(schema)).toString('base64')}'
  isRoot={true}
  hrefFmt='/schema/reference/{ref}/' />
`;
	writeFileSync(filePath, content, { encoding: "utf-8" });
	console.log(
		styleText("green", "ZTR"),
		styleText("bold", `${schema.id.toLocaleLowerCase()}.mdx`),
		styleText("green", schema.id),
	);
}

/*
Entrypoint
==========
*/

console.log(styleText("blue", "ZTR"), "Zod to reference start");

const referenceDir = resolve(
	import.meta.filename,
	"../../../../../docs/src/content/docs/schema/reference/",
);
rmSync(referenceDir, { recursive: true, force: true });
mkdirSync(referenceDir, { recursive: true });

const jsonSchema = z.toJSONSchema(resumeSchema, {
	metadata: primaryRegistry,
	reused: "inline",
	cycles: "ref",
	io: "input",
});
for (const schemaDef of Object.values(jsonSchema.$defs ?? {})) {
	generateMarkdownPage(schemaDef as JsonSchema);
}
delete jsonSchema.$defs;
generateMarkdownPage(jsonSchema as JsonSchema);

console.log(styleText("green", "ZTR"), "⚡️ Zod to reference success");
