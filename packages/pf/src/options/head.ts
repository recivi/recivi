import { z } from 'astro/zod'

const tagSchema = z.object({
  /** the name of the tag */
  tag: z.string(),
  /** a mapping of attribute names and values for the tag */
  attrs: z
    .record(z.union([z.string(), z.boolean(), z.undefined()]))
    .optional()
    .default({}),
  /** the inner HTML content of the tag */
  content: z.string().optional(),
})

export const headSchema = z.object({
  /** a list of arbitrary elements to include in the document `<head>` */
  elements: z.array(tagSchema).optional().default([]),
})
