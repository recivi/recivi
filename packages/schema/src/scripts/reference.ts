/**
 * Convert Zod schema to reference pages and place them in the docs.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import chalk from 'chalk'
import { z } from 'zod'

import { resumeSchema } from '@/index' // Import from the barrel file.
import { primaryRegistry } from '@/registries/primary'

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
  isRoot={true} />
`
  writeFileSync(filePath, content, { encoding: 'utf-8' })
  console.log(
    chalk.green('ZTR'),
    chalk.bold(`${schema.id.toLocaleLowerCase()}.mdx`),
    chalk.green(schema.id),
  )
}

/*
Entrypoint
==========
*/

console.log(chalk.blue('ZTR'), 'Zod to reference start')

const referenceDir = resolve(
  import.meta.filename,
  '../../../../../docs/src/content/docs/schema/reference/',
)
rmSync(referenceDir, { recursive: true, force: true })
mkdirSync(referenceDir, { recursive: true })

const jsonSchema = z.toJSONSchema(resumeSchema, {
  metadata: primaryRegistry,
  reused: 'ref',
  cycles: 'ref',
  io: 'input',
})
for (const schemaDef of Object.values(jsonSchema.$defs ?? {})) {
  generateMarkdownPage(schemaDef as JsonSchema)
}
delete jsonSchema.$defs
generateMarkdownPage(jsonSchema as JsonSchema)

console.log(chalk.green('ZTR'), '⚡️ Zod to reference success')
