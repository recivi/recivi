import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const addressSchema = z
  .object({
    countryCode: z.string().length(2).register(primaryRegistry, {
      description:
        'the ISO 3166-1 Alpha-2 code for the country in which the address is located',
    }),
    city: z.string().optional().register(primaryRegistry, {
      description: 'the city in which the address is located',
    }),
    state: z.string().optional().register(primaryRegistry, {
      description:
        'the state or province in which the address is located; Some implementations would prefer a 2-letter abbreviation of the state.',
    }),
    // This is a string because postal codes can start with zeros. Whether some
    // countries use non-numeric codes was not factored into the decision.
    postalCode: z.string().optional().register(primaryRegistry, {
      description:
        'the PIN/ZIP code, at which the location can receive mail; This can also be a postbox that is disconnected from the geographical location.',
    }),
  })
  .register(primaryRegistry, {
    id: 'Address',
    description:
      'a physical geographical location; This field can optionally include mailing information.',
    examples: [
      {
        city: 'Roorkee',
        state: 'UK',
        countryCode: 'IN',
        postalCode: '247667',
      },
      {
        countryCode: 'IN',
      },
    ],
  })

export type Address = z.infer<typeof addressSchema>
