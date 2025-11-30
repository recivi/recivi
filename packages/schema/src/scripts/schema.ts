/**
 * Convert Zod schema to a JSON Schema schema and place it in the docs.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import chalk from 'chalk'
import { z } from 'zod'

import { resumeSchema } from '@/index' // Import from the barrel file.
import { primaryRegistry } from '@/registries/primary'

console.log(chalk.blue('ZTS'), 'Zod to JSON Schema start')

const schemasDir = resolve(
  import.meta.filename,
  '../../../../../packages/docs/public/schemas/',
)
rmSync(schemasDir, { recursive: true, force: true })
mkdirSync(schemasDir, { recursive: true })

const jsonSchema = z.toJSONSchema(resumeSchema, {
  metadata: primaryRegistry,
  reused: 'ref',
  cycles: 'ref',
  io: 'input',
})
const content = JSON.stringify(jsonSchema, null, 2)
const schemaPath = join(schemasDir, 'recivi-resume.json')
writeFileSync(schemaPath, content, { encoding: 'utf-8' })
console.log(chalk.green('ZTS'), chalk.bold('recivi-resume.json'))

for (const [key] of Object.entries(jsonSchema.$defs ?? {})) {
  // Verify that no keys are anonymous. Anonymous keys are named with a
  // prefix "__schema".
  if (/^__schema\d+$/.test(key)) {
    console.log(chalk.red('ZTS'), `Anonymous schema definition found: ${key}`)
    console.log(chalk.red('ZTS'), '⚡️ Zod to JSON Schema failed')
    process.exit(1)
  }
}

console.log(chalk.green('ZTS'), '⚡️ Zod to JSON Schema success')
