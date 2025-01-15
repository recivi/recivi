import { z } from 'zod'

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

export const roleTypeSchema = z.enum(ROLE_TYPE)

export type RoleType = z.infer<typeof roleTypeSchema>
