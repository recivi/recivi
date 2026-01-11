import { z } from 'zod'

import { type Period, periodSchema } from '@/models/base/period'
import { type Tag, tagSchema } from '@/models/base/tag'
import { type Url, urlSchema } from '@/models/base/url'
import { type Tech, techSchema } from '@/models/creations/tech'
import type { PartialWithUndefined } from '@/models/utils/partial'
import { primaryRegistry } from '@/registries/primary'

export const projectSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description: 'an identifier for the project',
    }),
    name: z.string().register(primaryRegistry, {
      description: 'the name of the project',
    }),
    url: urlSchema.optional().register(primaryRegistry, {
      description: 'the public facing URL to access this project',
    }),
    summary: z.string().optional().register(primaryRegistry, {
      description: 'a short description or introduction of the project',
    }),
    description: z.string().optional().register(primaryRegistry, {
      description:
        'long-form description of the project; This is used where space is not constrained.',
    }),
    highlights: z
      .array(z.string())
      .optional()
      .default([])
      .register(primaryRegistry, {
        description:
          'a list of highlights, like noteworthy or salient features, from the project',
      }),
    role: z.string().optional().register(primaryRegistry, {
      description: 'the role of the user in this project',
    }),
    technologies: z
      .array(techSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of technologies used in this project',
      }),
    period: periodSchema.clone().optional().register(primaryRegistry, {
      description: 'the period over which the project was built or maintained',
    }),
    tags: z.array(tagSchema).optional().default([]).register(primaryRegistry, {
      description:
        'tags to apply to this project; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).',
    }),
  })
  .register(primaryRegistry, {
    id: 'Project',
    description: 'a creative endeavour undertaken as a part of a larger epic',
  })

export type Project = Omit<
  z.infer<typeof projectSchema>,
  'url' | 'technologies' | 'period' | 'tags'
> & {
  technologies: Tech[]
  tags: Tag[]
} & PartialWithUndefined<{
    url: Url
    period: Period
  }>
