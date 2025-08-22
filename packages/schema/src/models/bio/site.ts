import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const siteSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description:
        'a slug for the site; In implementations, this can be used as a key to find the icon for the site.',
    }),
    name: z.string().register(primaryRegistry, {
      description:
        "the readable name of the site, as it should be displayed to users; This should follow the site's preferred punctuation and capitalization.",
    }),
  })
  .register(primaryRegistry, {
    id: 'Site',
    description:
      'a web platform on which a person can have a profile; This can be a professional website or social network.',
    examples: [
      {
        id: 'github',
        name: 'GitHub',
      },
      {
        name: 'Personal',
      },
    ],
  })

export type Site = z.infer<typeof siteSchema>
