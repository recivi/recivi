import { z } from 'zod'

export const phoneSchema = z
  .object({
    countryCode: z
      .number()
      .int()
      .describe(
        "the country calling code for the phone number, without any leading '+' or zeroes; In implementations, the country code may be used as the key to look up the country name."
      ),
    number: z
      .string()
      .describe(
        'the phone number itself, in the preferred format; This can include hyphens, parentheses and space.'
      ),
  })
  .describe(
    JSON.stringify({
      examples: [
        { countryCode: 91, number: '9876543210' },
        { countryCode: 1, number: '(877) 273-3049' },
      ],
      description: 'a telephone number that can be used to reach the entity',
    })
  )

export type Phone = z.infer<typeof phoneSchema>
