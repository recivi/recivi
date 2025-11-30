interface Schema {
  minimum?: number
  maximum?: number
  exclusiveMinimum?: number
  exclusiveMaximum?: number
  minLength?: number
  maxLength?: number
}

/**
 * Parse the range from a schema object.
 *
 * @param schema the schema object
 * @returns the range string or undefined
 */
export function parseRange(schema: Schema) {
  const range = []

  let hasMin = true
  if ('minimum' in schema) {
    range.push('[', schema.minimum)
  } else if ('exclusiveMinimum' in schema) {
    range.push('(', schema.exclusiveMinimum)
  } else {
    hasMin = false
    range.push('(', '∞')
  }

  range.push(', ')

  let hasMax = true
  if ('maximum' in schema) {
    range.push(schema.maximum, ']')
  } else if ('exclusiveMaximum' in schema) {
    range.push(schema.exclusiveMaximum, ')')
  } else {
    hasMax = false
    range.push('∞', ')')
  }

  if (!(hasMin || hasMax)) return undefined

  let rangeString = range.join('')
  rangeString = rangeString.replaceAll(
    '9007199254740991',
    '<code>MAX_SAFE_INTEGER</code>'
  )
  return rangeString
}

/**
 * Parse the length constraints from a schema object.
 *
 * @param schema the schema object
 * @returns the length constraints string or undefined
 */
export function parseLength(schema: Schema) {
  if (schema.minLength && schema.maxLength) {
    if (schema.minLength === schema.maxLength) {
      return schema.minLength
    }
    return `${schema.minLength} - ${schema.maxLength}`
  } else if (schema.minLength) {
    return `≥ ${schema.minLength}`
  } else if (schema.maxLength) {
    return `≤ ${schema.maxLength}`
  }
  return undefined
}
