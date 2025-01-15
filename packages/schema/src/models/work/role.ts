import { z } from 'zod'

import { type Period, periodSchema } from '@/models/base/period'
import {
  type RoleLocation,
  roleLocationSchema,
} from '@/models/work/role_location'
import { type RoleType, roleTypeSchema } from '@/models/work/role_type'
import { type Tag, tagSchema } from '@/models/base/tag'

export const roleSchema = z
  .object({
    id: z.string().optional().describe('an identifier for the role'),
    name: z.string().describe('the job title of the role'),
    summary: z
      .string()
      .optional()
      .describe('a short description or introduction of the role'),
    description: z
      .string()
      .optional()
      .describe(
        'long-form description of the role; This is used where space is not constrained.'
      ),
    highlights: z
      .array(z.string())
      .optional()
      .describe(
        'a list of highlights, like responsibilities or achievements, from the role'
      ),
    type: roleTypeSchema
      .optional()
      .describe(
        'the nature of the role, in terms of length, commitment and obligations'
      ),
    location: roleLocationSchema
      .optional()
      .describe('the nature of the role, in terms of place of work'),
    period: periodSchema
      .optional()
      .describe('the time duration for which the role was held'),
    epicIds: z
      .array(z.string())
      .optional()
      .describe(
        'the list of IDs for epics that were created or worked on during this role; This is a relationship to the `Epic` model.'
      ),
    tags: z
      .array(tagSchema)
      .optional()
      .describe(
        'tags to apply to this role; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).'
      ),
  })
  .describe('an experience of working in a role at an organisation')

export type Role = Omit<z.infer<typeof roleSchema>, 'tags'> &
  Partial<{
    type: RoleType
    location: RoleLocation
    period: Period
    tags: Tag[]
  }>
