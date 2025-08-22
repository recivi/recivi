import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const phoneSchema = z
  .object({
    countryCode: z.number().int().min(1).register(primaryRegistry, {
      description:
        "the country calling code for the phone number, without any leading '+' or zeroes; In implementations, the country code may be used as the key to look up the country name.",
    }),
    number: z.string().register(primaryRegistry, {
      description:
        'the phone number itself, in the preferred format; This can include hyphens, parentheses and space.',
    }),
  })
  .register(primaryRegistry, {
    id: 'Phone',
    description: 'a telephone number that can be used to reach the entity',
    examples: [
      { countryCode: 91, number: '9876543210' },
      { countryCode: 1, number: '(877) 273-3049' },
    ],
  })

export type Phone = z.infer<typeof phoneSchema>
