import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

import {
  type LanguageProficiency,
  languageProficiencySchema,
} from '@/models/bio/language_proficiency'

export const nameSchema = z.union([
  z.string().register(primaryRegistry, {
    description:
      'the name of the language, either in the language itself or in English; This form should be used when the language goes by one name.',
  }),
  z
    .object({
      id: z.string().optional().register(primaryRegistry, {
        description: 'the IETF BCP 47 language tag',
      }),
      name: z.string().register(primaryRegistry, {
        description:
          'endonym, i.e. the name of the language in the language itself',
      }),
      englishName: z.string().optional().register(primaryRegistry, {
        description: 'English exonym, i.e. the name of the language in English',
      }),
    })
    .register(primaryRegistry, {
      description:
        'the structured name of the language; This form should be used to provide multiple names and a unique ID.',
    }),
])

export const languageSchema = z
  .object({
    name: nameSchema.register(primaryRegistry, {
      description: 'basic information about the language name',
    }),
    speak: languageProficiencySchema
      .optional()
      .default('no')
      .register(primaryRegistry, {
        description: 'ability to speak using the language',
      }),
    listen: languageProficiencySchema
      .optional()
      .default('no')
      .register(primaryRegistry, {
        description: 'ability to understand speech spoken in the language',
      }),
    write: languageProficiencySchema
      .optional()
      .default('no')
      .register(primaryRegistry, {
        description: 'ability to write using the language',
      }),
    read: languageProficiencySchema
      .optional()
      .default('no')
      .register(primaryRegistry, {
        description: 'ability to read text written in the language',
      }),
  })
  .register(primaryRegistry, {
    id: 'Language',
    description: "a language and the user's proficiency in it",
    examples: [
      {
        name: 'English',
      },
      {
        name: 'हिन्दी',
        speak: 'native',
        write: 'professional_working',
        read: 'professional_working',
      },
      {
        name: {
          id: 'gu',
          name: 'ગુજરાતી',
          englishName: 'Gujarati',
        },
        listen: 'elementary',
      },
    ],
  })

export type Language = Omit<
  z.infer<typeof languageSchema>,
  'speak' | 'listen' | 'write' | 'read'
> & {
  speak: LanguageProficiency
  listen: LanguageProficiency
  write: LanguageProficiency
  read: LanguageProficiency
}
