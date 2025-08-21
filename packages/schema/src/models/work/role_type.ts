import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const ROLE_TYPE = [
  'full-time',
  'part-time',
  'contract',
  'internship',
  'freelance',
  'foss',
  'volunteer',
  'temp',
  'other',
] as const

export const roleTypeSchema = z.enum(ROLE_TYPE).register(primaryRegistry, {
  id: 'RoleType',
  description: 'the different ways in which a role can be staffed',
})

export type RoleType = z.infer<typeof roleTypeSchema>
