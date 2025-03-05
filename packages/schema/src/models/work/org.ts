import { z } from 'zod'

import type { PartialWithUndefined } from '@/models/utils/partial'
import { type Address, addressSchema } from '@/models/base/address'
import { type Contact, contactSchema } from '@/models/base/contact'
import { type Role, roleSchema } from '@/models/work/role'
import { type Url, urlSchema } from '@/models/base/url'

export const orgSchema = z
  .object({
    id: z
      .optional(z.string())
      .describe(
        'an identifier for the organisation; In implementations, this can be used as a key to find the logo for the organisation.'
      ),
    name: z.string().describe('the name of the organisation'),
    shortName: z
      .optional(z.string())
      .describe(
        "a short informal name for the organisation; This can be an abbreviation like 'CC' instead of 'Creative Commons', for example."
      ),
    summary: z
      .optional(z.string())
      .describe(
        'a short description or introduction of the organisation; This is used where space is limited such as a résumé.'
      ),
    description: z
      .optional(z.string())
      .describe(
        'long-form description of the organisation; This is used where space is not constrained.'
      ),
    url: z
      .optional(urlSchema)
      .describe(
        'the public facing URL to access the organisation website; This should be a place where more information about the organisation can be found.'
      ),
    address: z
      .optional(addressSchema)
      .describe(
        'the physical location of the organisation; This can be a workplace or the location where the organisation is registered to receive communications.'
      ),
    contact: z
      .optional(contactSchema)
      .describe('the contact information to reach the organisation'),
    roles: z
      .optional(z.array(roleSchema))
      .describe('a list of roles that are part of this organisation'),
  })
  .describe(
    'a company or institution that the user has worked for; The user can serve for one or more roles at an organisation.'
  )

export type Org = Omit<
  z.infer<typeof orgSchema>,
  'url' | 'address' | 'contact' | 'roles'
> &
  PartialWithUndefined<{
    url: Url
    address: Address
    contact: Contact
    roles: Role[]
  }>
