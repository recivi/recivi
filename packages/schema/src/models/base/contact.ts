import { z } from 'zod'

import { phoneSchema, type Phone } from '@/models/base/phone'

export const contactSchema = z
  .object({
    emails: z
      .optional(z.array(z.string().email()))
      .describe('a list of email addresses'),
    phones: z
      .optional(z.array(phoneSchema))
      .describe('a list of phone numbers'),
  })
  .describe('a collection of ways to contact a given entity')

export type Contact = Omit<z.infer<typeof contactSchema>, 'phones'> &
  Partial<{
    phones: Phone[]
  }>
