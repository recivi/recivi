/**
 * Convert Zod schema to a JSON Schema schema and place it in the docs.
 *
 * Also see the `reference.ts` script in the `packages/schema` package.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { z } from 'astro/zod'
import colors from 'piccolore'

import { optionsSchema } from '../options/index'
import { primaryRegistry } from '../registries/primary'

const { blue, bold, green } = colors

interface JsonSchema {
  id: string
  description?: string
}

function generateMarkdownPage(schema: JsonSchema): void {
  const filePath = join(referenceDir, `${schema.id.toLocaleLowerCase()}.mdx`)
  const content = `---
title: ${schema.id}
description: ${schema.description ?? 'undefined'}
tableOfContents: false
---

import Schema from '@/components/Schema.astro'

<Schema
  schemaString='${Buffer.from(JSON.stringify(schema)).toString('base64')}'
  isRoot={true}
  hrefFmt='/pf/reference/{ref}/' />
`
  writeFileSync(filePath, content, { encoding: 'utf-8' })
  console.log(
    green('ZTR'),
    bold(`${schema.id.toLocaleLowerCase()}.mdx`),
    green(schema.id),
  )
}

/*
Entrypoint
==========
*/

console.log(blue('ZTR'), 'Zod to reference start')

const referenceDir = resolve(
  import.meta.filename,
  '../../../../../docs/src/content/docs/pf/reference/',
)
rmSync(referenceDir, { recursive: true, force: true })
mkdirSync(referenceDir, { recursive: true })

const jsonSchema = z.toJSONSchema(optionsSchema, {
  metadata: primaryRegistry,
  reused: 'inline',
  cycles: 'ref',
  io: 'input',
})
for (const schemaDef of Object.values(jsonSchema.$defs ?? {})) {
  const def = schemaDef as Record<string, unknown>
  if (def.id) {
    generateMarkdownPage(def as unknown as JsonSchema)
  }
}
delete jsonSchema.$defs
generateMarkdownPage(jsonSchema as JsonSchema)

console.log(green('ZTR'), '⚡️ Zod to reference success')
