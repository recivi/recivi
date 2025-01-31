import { z } from 'zod'

import {
  type LanguageProficiency,
  languageProficiencySchema,
} from '@/models/bio/language_proficiency'

export const nameSchema = z.union([
  z
    .string()
    .describe(
      'the name of the language, either in the language itself or in English'
    ),
  z.object({
    id: z.string().optional().describe('the IETF BCP 47 language tag'),
    name: z
      .string()
      .describe(
        'endonym, i.e. the name of the language in the language itself'
      ),
    englishName: z
      .string()
      .optional()
      .describe('English exonym, i.e. the name of the language in English'),
  }),
])

export const languageSchema = z.object({
  name: nameSchema.describe('basic information about the language name'),
  speak: z
    .optional(languageProficiencySchema)
    .describe('ability to understand text written in the language'),
  listen: z
    .optional(languageProficiencySchema)
    .describe('ability to understand when others speak the language'),
  write: z
    .optional(languageProficiencySchema)
    .describe('ability to write comfortably using the language'),
  read: z
    .optional(languageProficiencySchema)
    .describe('ability to speak the language'),
})

/**
 * Examples:
 *
 * ```json
 * {
 *   "name": "German"
 * }
 * ```
 *
 * ---
 *
 * ```json
 * {
 *   "name": "हिन्दी",
 *   "speak": "native",
 *   "write": "professional_working"
 *   "read": "professional_working"
 * }
 * ```
 *
 *
 * ---
 *
 * ```json
 * {
 *   "name": {
 *     "id": "gu",
 *     "name": "ગુજરાતી",
 *     "englishName": "Gujarati"
 *   },
 *   "listen": "elementary"
 * }
 * ```
 */
export type Language = Omit<
  z.infer<typeof languageSchema>,
  'speak' | 'listen' | 'write' | 'read'
> & {
  speak?: LanguageProficiency
  listen?: LanguageProficiency
  write?: LanguageProficiency
  read?: LanguageProficiency
}
