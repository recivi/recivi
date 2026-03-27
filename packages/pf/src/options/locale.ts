import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'

export const localeSchema = z
  .object({
    /** the BCP-47 tag which identifies the language, script and region */
    bcp47: z.string().register(primaryRegistry, {
      description:
        'the BCP-47 tag which identifies the language, script and region',
    }),

    /** the direction in which the language is written */
    dir: z.enum(['ltr', 'rtl']).optional().register(primaryRegistry, {
      description: 'the direction in which the language is written',
    }),
  })
  .register(primaryRegistry, {
    id: 'locale',
    description: "the site's language settings",
  })
