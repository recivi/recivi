import { z } from 'zod'

import { type Url, urlSchema } from '@/models/base/url'

export const techSchema = z
  .object({
    id: z.optional(z.string()).describe('an identifier for the technology'),
    name: z.string().describe('the name of the technology'),
    shortName: z
      .optional(z.string())
      .describe('a short informal name for the technology'),
    url: z
      .optional(urlSchema)
      .describe('the URL to the website or documentation for the technology'),
  })
  .describe(
    'a programming language, tool or framework used in the creation of a project'
  )

/**
 * Examples:
 *
 * ```json
 * {
 *   "id": "react",
 *   "name": "React",
 * }
 * ```
 *
 * ---
 *
 * ```json
 * {
 *   "id": "typescript",
 *   "name": "TypeScript",
 *   "shortName": "TS"
 * }
 * ```
 *
 * ---
 *
 * ```json
 * {
 *   "id": "recivi",
 *   "name": "Récivi",
 *   "url": {
 *     "dest": "https://recivi.vercel.app",
 *     "label": "Récivi homepage"
 *   }
 * }
 * ```
 */
export type Tech = Omit<z.infer<typeof techSchema>, 'url'> &
  Partial<{
    url: Url
  }>
