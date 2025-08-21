import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

import { phoneSchema, type Phone } from '@/models/base/phone'

export const contactSchema = z
  .object({
    emails: z
      .array(z.email())
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of email addresses',
      }),
    phones: z
      .array(phoneSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of phone numbers',
      }),
  })
  .register(primaryRegistry, {
    id: 'Contact',
    description: 'a collection of ways to contact a given entity',
    examples: [
      {
        emails: ['alice@example.com'],
        phones: [{ countryCode: 91, number: '9876543210' }],
      },
    ],
  })

export type Contact = Omit<z.infer<typeof contactSchema>, 'phones'> & {
  phones: Phone[]
}
