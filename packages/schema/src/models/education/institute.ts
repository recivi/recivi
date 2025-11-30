import { z } from 'zod'

import { type Address, addressSchema } from '@/models/base/address'
import { type Contact, contactSchema } from '@/models/base/contact'
import { type Url, urlSchema } from '@/models/base/url'
import { type Cert, certSchema } from '@/models/education/cert'
import type { PartialWithUndefined } from '@/models/utils/partial'

import { primaryRegistry } from '@/registries/primary'

export const instituteSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description:
        'an identifier for the institute; In implementations, this can be used as a key to find the logo for the institute.',
    }),
    name: z.string().register(primaryRegistry, {
      description: 'the name of the institute',
    }),
    shortName: z.string().optional().register(primaryRegistry, {
      description:
        'a short informal name for the institute; This can be an abbreviation.',
    }),
    url: urlSchema.optional().register(primaryRegistry, {
      description:
        'the public facing URL to access the institute website; This should be a place where more information about the institute can be found.',
    }),
    address: addressSchema.optional().register(primaryRegistry, {
      description:
        'the physical location of the institute; This can be a campus or the location where the institute is registered to receive communications.',
    }),
    contact: contactSchema.optional().register(primaryRegistry, {
      description: 'the contact information to reach the institute',
    }),
    certs: z
      .array(certSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of certifications earned at the institute',
      }),
  })
  .register(primaryRegistry, {
    id: 'Institute',
    description:
      'an organisation that imparts education or training, and offers certifications to corroborate the same; The user can acquire one or more certifications from an institute.',
    examples: [
      {
        id: 'mit',
        name: 'Massachusetts Institute of Technology',
        shortName: 'MIT',
        url: 'https://web.mit.edu/',
        address: {
          city: 'Cambridge',
          state: 'Massachusetts',
          countryCode: 'US',
          postalCode: '02139',
        },
      },
    ],
  })

export type Institute = Omit<
  z.infer<typeof instituteSchema>,
  'url' | 'address' | 'contact' | 'certs'
> & {
  certs: Cert[]
} & PartialWithUndefined<{
    url: Url
    address: Address
    contact: Contact
  }>
