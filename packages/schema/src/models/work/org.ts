import { z } from 'zod'

import { type Address, addressSchema } from '@/models/base/address'
import { type Contact, contactSchema } from '@/models/base/contact'
import { type Url, urlSchema } from '@/models/base/url'
import type { PartialWithUndefined } from '@/models/utils/partial'
import { type Role, roleSchema } from '@/models/work/role'

import { primaryRegistry } from '@/registries/primary'

export const orgSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description:
        'an identifier for the organisation; In implementations, this can be used as a key to find the logo for the organisation.',
    }),
    name: z.string().register(primaryRegistry, {
      description: 'the name of the organisation',
    }),
    shortName: z.string().optional().register(primaryRegistry, {
      description:
        "a short informal name for the organisation; This can be an abbreviation like 'CC' instead of 'Creative Commons', for example.",
    }),
    summary: z.string().optional().register(primaryRegistry, {
      description:
        'a short description or introduction of the organisation; This is used where space is limited such as a résumé.',
    }),
    description: z.string().optional().register(primaryRegistry, {
      description:
        'long-form description of the organisation; This is used where space is not constrained.',
    }),
    url: urlSchema.optional().register(primaryRegistry, {
      description:
        'the public facing URL to access the organisation website; This should be a place where more information about the organisation can be found.',
    }),
    address: addressSchema.optional().register(primaryRegistry, {
      description:
        'the physical location of the organisation; This can be a workplace or the location where the organisation is registered to receive communications.',
    }),
    contact: contactSchema.optional().register(primaryRegistry, {
      description: 'the contact information to reach the organisation',
    }),
    roles: z
      .array(roleSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of roles that are part of this organisation',
      }),
  })
  .register(primaryRegistry, {
    id: 'Org',
    description:
      'a company or institution that the user has worked for; The user can serve for one or more roles at an organisation.',
  })

export type Org = Omit<
  z.infer<typeof orgSchema>,
  'url' | 'address' | 'contact' | 'roles'
> & {
  roles: Role[]
} & PartialWithUndefined<{
    url: Url
    address: Address
    contact: Contact
  }>
