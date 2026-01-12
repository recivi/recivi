import { z } from 'astro/zod'

export const localeSchema = z.object({
  /** the BCP-47 tag which identifies the language, script and region */
  bcp47: z.string(),

  /** the direction in which the language is written */
  dir: z.enum(['ltr', 'rtl']).optional(),
})
