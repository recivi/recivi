/**
 * Convert Zod schema to reference pages and place them in the docs.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

import chalk from 'chalk'
import {
  type ZodType,
  type ZodNumberCheck,
  type ZodTypeAny,
  ZodUndefined,
  ZodObject,
  ZodArray,
  ZodUnion,
  ZodNumber,
  ZodLiteral,
  ZodString,
  ZodLazy,
  ZodTuple,
  ZodEffects,
  ZodOptional,
  ZodDefault,
  ZodEnum,
} from 'zod'

import * as index from '@/index' // Import from the barrel file.

interface SchemaData {
  reference?: string

  name: string
  level: number
  type: string
  description?: string
  examples?: unknown[]

  info?: Record<string, { toString(): string } | undefined>
  default?: string
  isOptional?: boolean
  isRefined?: boolean
  children?: SchemaData[]
}

function generateMarkdown(s: SchemaData): string {
  return [
    s.level && `${'#'.repeat(s.level + 1)} \`${s.name}\``,
    '',
    s.reference
      ? `**type:** [\`${s.reference}\`](/reference/${s.reference.toLowerCase()})  `
      : `**type:** \`${s.type}\`  `,
    s.isOptional && '**optional?** yes  ',
    s.default && `**default:** \`${JSON.stringify(s.default)}\`  `,
    s.isRefined && '**additional validation?** yes  ',
    ...Object.entries(s.info ?? {}).map(
      ([key, value]) => `**${key}**: ${value}  `
    ),
    '',
    s.description,
    '',
    !s.reference &&
      s.examples &&
      `<details>
<summary>Examples</summary>
${s.examples
  ?.map((ex) => '```json\n' + JSON.stringify(ex, null, 2) + '\n```')
  .join('\n')}
</details>`,
    '',
    ...(s.children?.map(generateMarkdown) ?? []),
  ]
    .filter((val) => val === '' || Boolean(val))
    .join('\n')
    .trim()
}

function visitCommon(name: string, level: number, s: ZodType): SchemaData {
  // Check if the schema is a known one exported from the barrel file.
  let reference
  for (const [key, value] of Object.entries(index)) {
    if (value === s) {
      reference = key
      break
    }
  }

  let schemaData
  if (reference && level) {
    schemaData = { type: reference, reference, name, level }
  } else if (s instanceof ZodOptional) {
    schemaData = visitOptional(name, level, s)
  } else if (s instanceof ZodDefault) {
    schemaData = visitDefault(name, level, s)
  } else if (s instanceof ZodEffects) {
    schemaData = visitEffects(name, level, s)
  } else if (s instanceof ZodLazy) {
    schemaData = visitLazy(name, level, s)
  } else if (s instanceof ZodArray) {
    schemaData = visitArray(name, level, s)
  } else if (s instanceof ZodTuple) {
    schemaData = visitTuple(name, level, s)
  } else if (s instanceof ZodObject) {
    schemaData = visitObject(name, level, s)
  } else if (s instanceof ZodUnion) {
    schemaData = visitUnion(name, level, s)
  } else if (s instanceof ZodLiteral) {
    schemaData = visitLiteral(name, level, s)
  } else if (s instanceof ZodEnum) {
    schemaData = visitEnum(name, level, s)
  } else if (s instanceof ZodUndefined) {
    schemaData = visitUndefined(name, level)
  } else if (s instanceof ZodNumber) {
    schemaData = visitNumber(name, level, s)
  } else if (s instanceof ZodString) {
    schemaData = visitString(name, level, s)
  } else {
    throw new Error('Unknown schema encountered!')
  }

  // Add common description
  const description = s.description
  if (description?.includes('"description":')) {
    const descriptionObj = JSON.parse(description)
    schemaData.description = descriptionObj.description
    schemaData.examples = descriptionObj.examples
  } else {
    schemaData.description = description
  }

  return schemaData
}

/*
Visitors
========
*/

function visitOptional(
  name: string,
  level: number,
  s: ZodOptional<ZodTypeAny>
): SchemaData {
  const inner = visitCommon(name, level, s.unwrap())
  return { ...inner, isOptional: true }
}

function visitDefault(
  name: string,
  level: number,
  s: ZodDefault<ZodTypeAny>
): SchemaData {
  const inner = visitCommon(name, level, s.removeDefault())
  return { ...inner, default: s._def.defaultValue() }
}

function visitEffects(
  name: string,
  level: number,
  s: ZodEffects<ZodTypeAny>
): SchemaData {
  const inner = visitCommon(name, level, s.innerType())
  return { ...inner, isRefined: true }
}

function visitLazy(
  name: string,
  level: number,
  s: ZodLazy<ZodTypeAny>
): SchemaData {
  return visitCommon(name, level, s.schema)
}

function visitArray(
  name: string,
  level: number,
  s: ZodArray<ZodTypeAny>
): SchemaData {
  const inner = visitCommon(`${name}[idx]`, level + 1, s.element)
  return { type: 'array', name, level, children: [inner] }
}

function visitTuple(
  name: string,
  level: number,
  s: ZodTuple<[ZodTypeAny, ...ZodTypeAny[]]>
): SchemaData {
  const children = s.items.map((item, idx) => {
    return visitCommon(`${name}[${idx}]`, level + 1, item)
  })
  return { type: 'tuple', name, level, children }
}

function visitObject(
  name: string,
  level: number,
  s: ZodObject<Record<string, ZodTypeAny>>
): SchemaData {
  const children = Object.entries(s.shape).map(([key, value]) => {
    return visitCommon(key, level + 1, value)
  })
  return { type: 'object', name, level, children }
}

function visitUnion(
  name: string,
  level: number,
  s: ZodUnion<[ZodTypeAny, ...ZodTypeAny[]]>
): SchemaData {
  const children = s.options.map((option, idx) => {
    return visitCommon(`${name}/${idx}`, level + 1, option)
  })
  return { type: 'union', name, level, children }
}

function visitLiteral(
  name: string,
  level: number,
  s: ZodLiteral<unknown>
): SchemaData {
  return { type: 'literal', name, level, info: { value: s.value?.toString() } }
}

function visitEnum(
  name: string,
  level: number,
  s: ZodEnum<[string, ...string[]]>
): SchemaData {
  return { type: 'enum', name, level, info: { values: s.options.join(', ') } }
}

function visitUndefined(name: string, level: number): SchemaData {
  return { type: 'undefined', name, level }
}

function visitNumber(name: string, level: number, s: ZodNumber): SchemaData {
  let min: ZodNumberCheck | null = null
  let max: ZodNumberCheck | null = null

  for (const check of s._def.checks) {
    if (check.kind === 'min' && (min === null || check.value > min.value))
      min = check
    if (check.kind === 'max' && (max === null || check.value < max.value))
      max = check
  }

  const info: Record<string, { toString(): string }> = {}
  if (min || max) {
    const minStr = min ? `${min.inclusive ? '[' : '('}${min.value}` : '(-∞'
    const maxStr = max ? `${max.value}${max.inclusive ? ']' : ')'}` : '∞)'
    info.range = `${minStr}, ${maxStr}`
  }

  return { type: 'number', name, level, info }
}

function visitString(name: string, level: number, s: ZodString): SchemaData {
  let len: number | null = null
  let min: number | null = null
  let max: number | null = null

  let isEmail = false
  let isUrl = false

  for (const check of s._def.checks) {
    if (check.kind === 'length') len = check.value
    if (check.kind === 'min' && (min === null || check.value > min))
      min = check.value
    if (check.kind === 'max' && (max === null || check.value < max))
      max = check.value
    if (check.kind === 'email') isEmail = true
    if (check.kind === 'url') isUrl = true
  }

  const info: Record<string, { toString(): string }> = {}
  if (len) {
    info['exact length'] = len
  } else if (max || min) {
    const minStr = min ? `[${min}` : '(-∞'
    const maxStr = max ? `${max}]` : '∞)'
    info['number of characters'] = `${minStr}, ${maxStr}`
  }
  if (isEmail) {
    info.kind = 'email'
  } else if (isUrl) {
    info.kind = 'URL'
  }

  return { type: 'string', name, level, info }
}

/*
Entrypoint
==========
*/

console.log(chalk.blue('ZTR'), 'Zod to reference start')

const referenceDir = resolve(
  import.meta.filename,
  '../../../../../packages/docs/src/content/docs/reference/'
)
mkdirSync(referenceDir, { recursive: true })

const validities = Object.entries(index).map(([key, value]) => {
  try {
    const data = visitCommon(key, 0, value)
    const content = `---
title: ${data.name}
description: ${data.description}
---

${generateMarkdown(data)}`
    const filePath = join(referenceDir, `${key}.mdx`)
    writeFileSync(filePath, content, { encoding: 'utf-8' })
    console.log(chalk.green('ZTR'), chalk.bold(key), chalk.green(`${key}.mdx`))
    return true
  } catch (error) {
    console.log(chalk.red('ZTR'), chalk.bold(key), chalk.red(error))
    return false
  }
})

if (validities.includes(false)) {
  // At least one file was invalid.
  console.log(chalk.red('ZTR'), '× Zod to reference failure')
  process.exit(1)
} else {
  console.log(chalk.green('ZTR'), '⚡️ Zod to reference success')
}
