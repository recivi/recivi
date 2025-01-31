import { z } from 'zod'

export const LANGUAGE_PROFICIENCIES = [
  'no',
  'elementary',
  'limited_working',
  'professional_working',
  'full_professional',
  'native',
] as const

export const languageProficiencySchema = z.enum(LANGUAGE_PROFICIENCIES)

export type LanguageProficiency = z.infer<typeof languageProficiencySchema>
