/**
 * Collect all types and schemas from the code into a barrel file.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

import { globSync } from 'glob'
import chalk from 'chalk'

const EXPORT_TYPE_RE = /export (?:interface|type) (?<name>\w+)/
const EXPORT_ZOD_RE = /export const (?<name>\w+Schema)/

const srcPath = resolve(import.meta.filename, '../../')

console.log(chalk.blue('BRL'), 'Barrel start')

const allTsFiles = globSync(`${srcPath}/models/**/*.ts`)
let typesCount = 0
let schemasCount = 0

const fileExports = allTsFiles.flatMap((tsFile) => {
  const code = readFileSync(tsFile, { encoding: 'utf-8' })
  const importPath = `@${tsFile.split(/schema\/src/)[1].replace(/\.ts$/, '')}`
  const lines = code.split('\n')

  const types = lines
    .map((line) => EXPORT_TYPE_RE.exec(line)?.groups?.name)
    .filter(Boolean)
    .map((name) => `export type { ${name} } from '${importPath}'`)
  typesCount += types.length

  const schemas = lines
    .map((line) => EXPORT_ZOD_RE.exec(line)?.groups?.name)
    .filter(Boolean)
    .map((name) => `export { ${name} } from '${importPath}'`)
  schemasCount += schemas.length

  return [...types, ...schemas]
})

const barrelPath = join(srcPath, 'index.ts')
writeFileSync(barrelPath, fileExports.join('\n'), { encoding: 'utf-8' })

console.log(
  chalk.green('BRL'),
  chalk.bold('src/index.ts'),
  chalk.green(`${typesCount} types`)
)
console.log(
  chalk.green('BRL'),
  chalk.bold('src/index.ts'),
  chalk.green(`${schemasCount} schemas`)
)
console.log(chalk.green('BRL'), '⚡️ Barrel success')
