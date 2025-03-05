import { z } from 'zod'

import type { PartialWithUndefined } from '@/models/utils/partial'
import { type Tech, techSchema } from '@/models/creations/tech'
import { type Period, periodSchema } from '@/models/base/period'
import { type Url, urlSchema } from '@/models/base/url'
import { type Tag, tagSchema } from '@/models/base/tag'

export const projectSchema = z
  .object({
    id: z.optional(z.string()).describe('an identifier for the project'),
    name: z.string().describe('the name of the project'),
    url: z
      .optional(urlSchema)
      .describe('the public facing URL to access this project'),
    summary: z
      .optional(z.string())
      .describe('a short description or introduction of the project'),
    description: z
      .optional(z.string())
      .describe(
        'long-form description of the project; This is used where space is not constrained.'
      ),
    highlights: z
      .optional(z.array(z.string()))
      .describe(
        'a list of highlights, like noteworthy or salient features, from the project'
      ),
    role: z
      .optional(z.string())
      .describe('the role of the user in this project'),
    technologies: z
      .optional(z.array(techSchema))
      .describe('a list of technologies used in this project'),
    period: z
      .optional(periodSchema)
      .describe('the period over which the project was built or maintained'),
    tags: z
      .optional(z.array(tagSchema))
      .describe(
        'tags to apply to this project; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).'
      ),
  })
  .describe('a creative endeavour undertaken as a part of a larger epic')

export type Project = Omit<
  z.infer<typeof projectSchema>,
  'url' | 'technologies' | 'period' | 'tags'
> &
  PartialWithUndefined<{
    url: Url
    technologies: Tech[]
    period: Period
    tags: Tag[]
  }>
