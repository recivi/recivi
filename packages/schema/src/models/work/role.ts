import { z } from 'zod'

import type { PartialWithUndefined } from '@/models/utils/partial'
import { type Period, periodSchema } from '@/models/base/period'
import {
  type RoleLocation,
  roleLocationSchema,
} from '@/models/work/role_location'
import { type RoleType, roleTypeSchema } from '@/models/work/role_type'
import { type Tag, tagSchema } from '@/models/base/tag'

export const roleSchema = z
  .object({
    id: z.optional(z.string()).describe('an identifier for the role'),
    name: z.string().describe('the job title of the role'),
    summary: z
      .optional(z.string())
      .describe('a short description or introduction of the role'),
    description: z
      .optional(z.string())
      .describe(
        'long-form description of the role; This is used where space is not constrained.'
      ),
    highlights: z
      .optional(z.array(z.string()))
      .describe(
        'a list of highlights, like responsibilities or achievements, from the role'
      ),
    type: z
      .optional(roleTypeSchema)
      .describe(
        'the nature of the role, in terms of length, commitment and obligations'
      ),
    location: z
      .optional(roleLocationSchema)
      .describe('the nature of the role, in terms of place of work'),
    period: z
      .optional(periodSchema)
      .describe('the time duration for which the role was held'),
    epicIds: z
      .optional(z.array(z.string()))
      .describe(
        'the list of IDs for epics that were created or worked on during this role; This is a relationship to the `Epic` model.'
      ),
    tags: z
      .optional(z.array(tagSchema))
      .describe(
        'tags to apply to this role; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).'
      ),
  })
  .describe('an experience of working in a role at an organisation')

export type Role = Omit<z.infer<typeof roleSchema>, 'tags'> &
  PartialWithUndefined<{
    type: RoleType
    location: RoleLocation
    period: Period
    tags: Tag[]
  }>
