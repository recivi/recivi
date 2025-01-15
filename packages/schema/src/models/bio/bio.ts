import { z } from 'zod'

import { type Skill, skillSchema } from '@/models/bio/skill'
import { type Profile, profileSchema } from '@/models/bio/profile'
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
      .string()
      .optional()
      .describe(
        'the full name of the person; The person may not want to disclose this for privacy reasons.'
      ),
    aliases: z
      .array(z.string())
      .optional()
      .describe(
        'a list of other names that the person goes by; This can be a nickname, a pseudonym, or the name in a different language.'
      ),
    image: z
      .string()
      .url()
      .optional()
      .describe(
        'the URL to a profile picture for the person; For example, this can be a Gravatar link, or the URL to an image hosted on a public URL.'
      ),
    labels: z
      .array(z.string())
      .optional()
      .describe('a few short labels describing the person'),
    summary: z
      .string()
      .optional()
      .describe('a fairly brief summary of the person'),
    introduction: z
      .string()
      .optional()
      .describe('a fairly long introduction about the person'),
    description: z
      .string()
      .optional()
      .describe('a detailed description of the person'),
    contact: contactSchema
      .optional()
      .describe('the contact information to reach the person'),
    profiles: z
      .array(profileSchema)
      .optional()
      .describe('a list of web profiles for the person'),
    skills: z
      .array(skillSchema)
      .optional()
      .describe('a list of skills that the person has'),
    residence: addressSchema
      .optional()
      .describe('current location where the person resides'),
    origin: addressSchema
      .optional()
      .describe('location where the person comes from or holds citizenship of'),
  })
  .describe('information related to the identity of a person')

export type Bio = Omit<
  z.infer<typeof bioSchema>,
  'contact' | 'profiles' | 'skills' | 'residence' | 'origin'
> &
  Partial<{
    contact: Contact
    profiles: Profile[]
    skills: Skill[]
    residence: Address
    origin: Address
  }>
