import { z } from 'zod'

export const ROLE_LOCATIONS = ['remote', 'onsite', 'hybrid'] as const

export const roleLocationSchema = z.enum(ROLE_LOCATIONS)

export type RoleLocation = z.infer<typeof roleLocationSchema>
