import { z } from 'zod'

export const addressSchema = z
  .object({
    countryCode: z
      .string()
      .length(2)
      .describe(
        'the ISO 3166-1 Alpha-2 code for the country in which the address is located'
      ),
    city: z
      .optional(z.string())
      .describe('the city in which the address is located'),
    state: z
      .optional(z.string())
      .describe(
        'the state or province in which the address is located; Some implementations would prefer a 2-letter abbreviation of the state.'
      ),
    postalCode: z
      .optional(z.number())
      .describe(
        'the PIN/ZIP code, at which the location can receive mail; This can also be a postbox that is disconnected from the geographical location.'
      ),
  })
  .describe(
    JSON.stringify({
      description:
        'a physical geographical location; This field can optionally include mailing information.',
      examples: [
        {
          city: 'Roorkee',
          state: 'UK',
          countryCode: 'IN',
          postalCode: 247667,
        },
        {
          countryCode: 'IN',
        },
      ],
    })
  )

export type Address = z.infer<typeof addressSchema>
