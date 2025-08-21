import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const LANGUAGE_PROFICIENCIES = [
  'no',
  'not_possible', // for languages that don't have certain modes
  'elementary',
  'limited_working',
  'professional_working',
  'full_professional',
  'native',
] as const

export const languageProficiencySchema = z
  .enum(LANGUAGE_PROFICIENCIES)
  .register(primaryRegistry, {
    id: 'LanguageProficiency',
    description: 'the proficiency level in some aspect of a language',
  })

export type LanguageProficiency = z.infer<typeof languageProficiencySchema>
