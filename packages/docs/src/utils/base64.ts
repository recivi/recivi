/**
 * Encode a string to Base64.
 *
 * @param input the string to encode
 * @returns the encoded string
 */
export function toBase64(input: string): string {
  return Buffer.from(input).toString('base64')
}

/**
 * Decode a string from Base64.
 *
 * @param input the string to decode
 * @returns the decoded string
 */
export function fromBase64(input: string): string {
  return Buffer.from(input, 'base64').toString()
}
