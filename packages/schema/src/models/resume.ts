import { z } from 'zod'

import type { PartialWithUndefined } from '@/models/utils/partial'
import { type Bio, bioSchema } from '@/models/bio/bio'
import { type Org, orgSchema } from '@/models/work/org'
import { type Epic, epicSchema } from '@/models/creations/epic'
import { type Institute, instituteSchema } from '@/models/education/institute'

export const resumeSchema = z.object({
  $schema: z
    .optional(z.string().url())
    .default('https://recivi.pages.dev/schemas/recivi-resume.json')
    .describe(
      'the URL to the JSON schema that should be used to validate this document'
    ),
  bio: bioSchema,
  creations: z
    .optional(z.array(epicSchema))
    .describe(
      'the creations of a person, which consists of projects under various epics'
    ),
  education: z
    .optional(z.array(instituteSchema))
    .describe(
      'the education of a person, which consists of certifications from various insitutes'
    ),
  work: z
    .optional(z.array(orgSchema))
    .describe(
      'the work experience of a person, which consists of positions of responsibility in various organisations'
    ),
})

export type Resume = Omit<
  z.infer<typeof resumeSchema>,
  'bio' | 'creations' | 'education' | 'work'
> & {
  bio: Bio
} & PartialWithUndefined<{
    creations: Epic[]
    education: Institute[]
    work: Org[]
  }>
