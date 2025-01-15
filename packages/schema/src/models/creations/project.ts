import { z } from 'zod'

import { type Tech, techSchema } from '@/models/creations/tech'
import { type Period, periodSchema } from '@/models/base/period'
import { type Url, urlSchema } from '@/models/base/url'
import { type Tag, tagSchema } from '@/models/base/tag'

export const projectSchema = z
  .object({
    id: z.string().optional().describe('an identifier for the project'),
    name: z.string().describe('the name of the project'),
    url: urlSchema
      .optional()
      .describe('the public facing URL to access this project'),
    summary: z
      .string()
      .optional()
      .describe('a short description or introduction of the project'),
    description: z
      .string()
      .optional()
      .describe(
        'long-form description of the project; This is used where space is not constrained.'
      ),
    highlights: z
      .array(z.string())
      .optional()
      .describe(
        'a list of highlights, like noteworthy or salient features, from the project'
      ),
    role: z
      .string()
      .optional()
      .describe('the role of the user in this project'),
    technologies: z
      .array(techSchema)
      .optional()
      .describe('a list of technologies used in this project'),
    period: periodSchema
      .optional()
      .describe('the period over which the project was built or maintained'),
    tags: z
      .array(tagSchema)
      .optional()
      .describe(
        'tags to apply to this project; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).'
      ),
  })
  .describe('a creative endeavour undertaken as a part of a larger epic')

export type Project = Omit<
  z.infer<typeof projectSchema>,
  'url' | 'technologies' | 'period' | 'tags'
> &
  Partial<{
    url: Url
    technologies: Tech[]
    period: Period
    tags: Tag[]
  }>
