/**
 * Convert Zod schema to a JSON Schema schema and place it in the docs.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

import chalk from 'chalk'

import { zodToJsonSchema } from 'zod-to-json-schema'

import {
  resumeSchema,
  addressSchema,
  contactSchema,
  coordsSchema,
  dateSchema,
  periodSchema,
  phoneSchema,
  tagSchema,
  urlSchema,
} from '@/index' // Import from the barrel file.

console.log(chalk.blue('ZTS'), 'Schema start')

const jsonSchema = zodToJsonSchema(resumeSchema, {
  // Collect all base models inside the `definitions` field.
  definitions: {
    addressSchema,
    contactSchema,
    coordsSchema,
    dateSchema,
    periodSchema,
    phoneSchema,
    tagSchema,
    urlSchema,
  },
})
const content = JSON.stringify(jsonSchema, null, 2)

const schemaDir = resolve(
  import.meta.filename,
  '../../../../../packages/docs/dist/schemas/'
)
mkdirSync(schemaDir, { recursive: true })

const schemaPath = join(schemaDir, 'recivi-resume.json')
writeFileSync(schemaPath, content, { encoding: 'utf-8' })

console.log(chalk.green('ZTS'), chalk.bold('recivi-resume.json'))
console.log(chalk.green('ZTS'), '⚡️ Zod to JSON Schema success')
