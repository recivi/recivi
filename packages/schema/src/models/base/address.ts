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
      .string()
      .optional()
      .describe('the city in which the address is located'),
    state: z
      .string()
      .optional()
      .describe(
        'the state or province in which the address is located; Some implementations would prefer a 2-letter abbreviation of the state.'
      ),
    postalCode: z
      .number()
      .optional()
      .describe(
        'the PIN/ZIP code, at which the location can receive mail; This can also be a postbox that is disconnected from the geographical location.'
      ),
  })
  .describe(
    'a physical geographical location; This field can optionally include mailing information.'
  )

/**
 * Examples:
 *
 * ```json
 * {
 *   "city": "Roorkee",
 *   "state": "UK",
 *   "countryCode": "IN",
 *   "postalCode": 247667
 * }
 * ```
 *
 * ---
 *
 * ```json
 * {
 *   "countryCode": "IN"
 * }
 * ```
 */
export type Address = z.infer<typeof addressSchema>
