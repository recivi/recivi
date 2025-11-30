import { z } from 'zod'

import { type Period, periodSchema } from '@/models/base/period'
import { type Tag, tagSchema } from '@/models/base/tag'
import type { PartialWithUndefined } from '@/models/utils/partial'
import {
  type RoleLocation,
  roleLocationSchema,
} from '@/models/work/role_location'
import { type RoleType, roleTypeSchema } from '@/models/work/role_type'

import { primaryRegistry } from '@/registries/primary'

export const roleSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description: 'an identifier for the role',
    }),
    name: z.string().register(primaryRegistry, {
      description: 'the job title of the role',
    }),
    summary: z.string().optional().register(primaryRegistry, {
      description: 'a short description or introduction of the role',
    }),
    description: z.string().optional().register(primaryRegistry, {
      description:
        'long-form description of the role; This is used where space is not constrained.',
    }),
    highlights: z
      .array(z.string())
      .optional()
      .default([])
      .register(primaryRegistry, {
        description:
          'a list of highlights, like responsibilities or achievements, from the role',
      }),
    type: roleTypeSchema.optional().register(primaryRegistry, {
      description:
        'the nature of the role, in terms of length, commitment and obligations',
    }),
    location: roleLocationSchema.optional().register(primaryRegistry, {
      description: 'the nature of the role, in terms of place of work',
    }),
    period: periodSchema.clone().optional().register(primaryRegistry, {
      description: 'the time duration for which the role was held',
    }),
    epicIds: z
      .array(z.string())
      .optional()
      .default([])
      .register(primaryRegistry, {
        description:
          'the list of IDs for epics that were created or worked on during this role; This is a relationship to the `Epic` model.',
      }),
    tags: z.array(tagSchema).optional().default([]).register(primaryRegistry, {
      description:
        'tags to apply to this role; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).',
    }),
  })
  .register(primaryRegistry, {
    id: 'Role',
    description: 'an experience of working in a role at an organisation',
  })

export type Role = Omit<z.infer<typeof roleSchema>, 'tags'> & {
  tags: Tag[]
} & PartialWithUndefined<{
    type: RoleType
    location: RoleLocation
    period: Period
  }>
