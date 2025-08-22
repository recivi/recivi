import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

import type { PartialWithUndefined } from '@/models/utils/partial'
import { type Skill, skillSchema } from '@/models/bio/skill'
import { type Profile, profileSchema } from '@/models/bio/profile'
import { type Language, languageSchema } from '@/models/bio/language'
import { type Contact, contactSchema } from '@/models/base/contact'
import { type Address, addressSchema } from '@/models/base/address'

export const bioSchema = z
  .object({
    name: z.string().register(primaryRegistry, {
      description:
        'the nickname or preferred name of the person; This should be the name used for most intents and purposes.',
    }),
    fullName: z.string().optional().register(primaryRegistry, {
      description:
        'the full name of the person; The person may not want to disclose this for privacy reasons.',
    }),
    aliases: z
      .array(z.string())
      .optional()
      .default([])
      .register(primaryRegistry, {
        description:
          'a list of other names that the person goes by; This can be a nickname, a pseudonym, or the name in a different language.',
      }),
    image: z.url().optional().register(primaryRegistry, {
      description:
        'the URL to a profile picture for the person; For example, this can be a Gravatar link, or the URL to an image hosted on a public URL.',
    }),
    labels: z.array(z.string()).default([]).register(primaryRegistry, {
      description: 'a few short labels describing the person',
    }),
    summary: z.string().optional().register(primaryRegistry, {
      description: 'a fairly brief summary of the person',
    }),
    introduction: z.string().optional().register(primaryRegistry, {
      description: 'a fairly long introduction about the person',
    }),
    description: z.string().optional().register(primaryRegistry, {
      description: 'a detailed description of the person',
    }),
    contact: contactSchema.optional().register(primaryRegistry, {
      description: 'the contact information to reach the person',
    }),
    profiles: z
      .array(profileSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of web profiles for the person',
      }),
    skills: z
      .array(skillSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of skills that the person has',
      }),
    languages: z
      .array(languageSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of languages that the person can work with',
      }),
    residence: addressSchema.optional().register(primaryRegistry, {
      description: 'current location where the person resides',
    }),
    origin: addressSchema.optional().register(primaryRegistry, {
      description:
        'location where the person comes from or holds citizenship of',
    }),
  })
  .register(primaryRegistry, {
    id: 'Bio',
    description: 'information related to the identity of a person',
  })

export type Bio = Omit<
  z.infer<typeof bioSchema>,
  'contact' | 'profiles' | 'skills' | 'residence' | 'origin'
> & {
  profiles: Profile[]
  skills: Skill[]
  languages: Language[]
} & PartialWithUndefined<{
    contact: Contact
    residence: Address
    origin: Address
  }>
