import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const urlSchema = z
  .union([
    z.url().register(primaryRegistry, {
      description:
        'the URL endpoint; This form should be used when a label is not provided.',
      examples: ['https://dhruvkb.dev'],
    }),
    z
      .object({
        dest: z.url().register(primaryRegistry, {
          description: 'the URL endpoint',
        }),
        label: z.string().register(primaryRegistry, {
          description:
            'a label for the URL; This makes the URL accessible and provides more info about the destination.',
        }),
      })
      .register(primaryRegistry, {
        description:
          'a combination of the URL endpoint and a label for a11y purposes; This form should be used when a label is provided.',
        examples: [
          {
            dest: 'https://dhruvkb.dev',
            label: 'My website',
          },
        ],
      }),
  ])
  .register(primaryRegistry, {
    id: 'Url',
    description: 'a URL endpoint and an optional label for a11y purposes',
    examples: [
      {
        dest: 'https://dhruvkb.dev',
        label: 'My website',
      },
      'https://dhruvkb.dev',
    ],
  })

export type Url = z.infer<typeof urlSchema>
