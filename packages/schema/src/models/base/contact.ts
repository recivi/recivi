import { z } from 'zod'

import { phoneSchema, type Phone } from '@/models/base/phone'

export const contactSchema = z
  .object({
    emails: z
      .array(z.string().email())
      .optional()
      .describe('a list of email addresses'),
    phones: z.array(phoneSchema).optional().describe('a list of phone numbers'),
  })
  .describe('a collection of ways to contact a given entity')

export type Contact = Omit<z.infer<typeof contactSchema>, 'phone'> &
  Partial<{
    phone: Phone
  }>
