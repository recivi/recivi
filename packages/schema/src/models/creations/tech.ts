import { z } from 'zod'

import { type Url, urlSchema } from '@/models/base/url'
import type { PartialWithUndefined } from '@/models/utils/partial'
import { primaryRegistry } from '@/registries/primary'

export const techSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description: 'an identifier for the technology',
    }),
    name: z.string().register(primaryRegistry, {
      description: 'the name of the technology',
    }),
    shortName: z.string().optional().register(primaryRegistry, {
      description: 'a short informal name for the technology',
    }),
    url: urlSchema.optional().register(primaryRegistry, {
      description: 'the URL to the website or documentation for the technology',
    }),
  })
  .register(primaryRegistry, {
    id: 'Tech',
    description:
      'a programming language, tool or framework used in the creation of a project',
    examples: [
      {
        id: 'react',
        name: 'React',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        shortName: 'TS',
      },
      {
        id: 'recivi',
        name: 'Récivi',
        url: {
          dest: 'https://recivi.vercel.app',
          label: 'Récivi homepage',
        },
      },
    ],
  })

export type Tech = Omit<z.infer<typeof techSchema>, 'url'> &
  PartialWithUndefined<{
    url: Url
  }>
