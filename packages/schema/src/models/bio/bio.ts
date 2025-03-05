import { z } from 'zod'

import type { PartialWithUndefined } from '@/models/utils/partial'
import { type Skill, skillSchema } from '@/models/bio/skill'
import { type Profile, profileSchema } from '@/models/bio/profile'
import { type Language, languageSchema } from '@/models/bio/language'
import { type Contact, contactSchema } from '@/models/base/contact'
import { type Address, addressSchema } from '@/models/base/address'

export const bioSchema = z
  .object({
    name: z
      .string()
      .describe(
        'the nickname or preferred name of the person; This should be the name used for most intents and purposes.'
      ),
    fullName: z
      .optional(z.string())
      .describe(
        'the full name of the person; The person may not want to disclose this for privacy reasons.'
      ),
    aliases: z
      .optional(z.array(z.string()))
      .describe(
        'a list of other names that the person goes by; This can be a nickname, a pseudonym, or the name in a different language.'
      ),
    image: z
      .optional(z.string().url())
      .describe(
        'the URL to a profile picture for the person; For example, this can be a Gravatar link, or the URL to an image hosted on a public URL.'
      ),
    labels: z
      .optional(z.array(z.string()))
      .describe('a few short labels describing the person'),
    summary: z
      .optional(z.string())
      .describe('a fairly brief summary of the person'),
    introduction: z
      .optional(z.string())
      .describe('a fairly long introduction about the person'),
    description: z
      .optional(z.string())
      .describe('a detailed description of the person'),
    contact: z
      .optional(contactSchema)
      .describe('the contact information to reach the person'),
    profiles: z
      .optional(z.array(profileSchema))
      .describe('a list of web profiles for the person'),
    skills: z
      .optional(z.array(skillSchema))
      .describe('a list of skills that the person has'),
    languages: z
      .optional(z.array(languageSchema))
      .describe('a list of languages that the person can work with'),
    residence: z
      .optional(addressSchema)
      .describe('current location where the person resides'),
    origin: z
      .optional(addressSchema)
      .describe('location where the person comes from or holds citizenship of'),
  })
  .describe('information related to the identity of a person')

export type Bio = Omit<
  z.infer<typeof bioSchema>,
  'contact' | 'profiles' | 'skills' | 'residence' | 'origin'
> &
  PartialWithUndefined<{
    contact: Contact
    profiles: Profile[]
    skills: Skill[]
    languages: Language[]
    residence: Address
    origin: Address
  }>
