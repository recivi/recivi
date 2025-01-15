import { z } from 'zod'

import { type Bio, bioSchema } from '@/models/bio/bio'
import { type Org, orgSchema } from '@/models/work/org'
import { type Epic, epicSchema } from '@/models/creations/epic'
import { type Institute, instituteSchema } from '@/models/education/institute'

export const resumeSchema = z.object({
  $schema: z
    .string()
    .url()
    .optional()
    .default('https://recivi.pages.dev/schemas/recivi-resume.json')
    .describe(
      'the URL to the JSON schema that should be used to validate this document'
    ),
  bio: bioSchema,
  creations: z
    .array(epicSchema)
    .optional()
    .describe(
      'the creations of a person, which consists of projects under various epics'
    ),
  education: z
    .array(instituteSchema)
    .optional()
    .describe(
      'the education of a person, which consists of certifications from various insitutes'
    ),
  work: z
    .array(orgSchema)
    .optional()
    .describe(
      'the work experience of a person, which consists of positions of responsibility in various organisations'
    ),
})

export type Resume = Omit<
  z.infer<typeof resumeSchema>,
  'bio' | 'creations' | 'education' | 'work'
> & {
  bio: Bio
  creations?: Epic[]
  education?: Institute[]
  work?: Org[]
}
