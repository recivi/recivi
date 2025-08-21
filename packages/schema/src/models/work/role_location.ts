import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const ROLE_LOCATIONS = ['remote', 'onsite', 'hybrid'] as const

export const roleLocationSchema = z
  .enum(ROLE_LOCATIONS)
  .register(primaryRegistry, {
    id: 'RoleLocation',
    description: 'the different locations a role can be based in',
  })

export type RoleLocation = z.infer<typeof roleLocationSchema>
