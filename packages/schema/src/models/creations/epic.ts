import { z } from 'zod'

import { type Project, projectSchema } from '@/models/creations/project'
import { type Url, urlSchema } from '@/models/base/url'

export const epicSchema = z
  .object({
    id: z
      .optional(z.string())
      .describe(
        'an identifier for the epic; In implementations, this can be used as a key to find the logo for the epic.'
      ),
    name: z.string().describe('the name of the epic'),
    url: z
      .optional(urlSchema)
      .describe(
        'the public facing URL to access this epic homepage; This should be a place where more information about the epic can be found.'
      ),
    summary: z
      .optional(z.string())
      .describe(
        'a short description or introduction of the epic; This is used where space is limited such as a résumé.'
      ),
    description: z
      .optional(z.string())
      .describe(
        'long-form description of the epic; This is used where space is not constrained.'
      ),
    projects: z
      .optional(z.array(projectSchema))
      .describe('a list of projects that are part of this epic'),
  })
  .describe(
    'a large creative endeavour that the user has undertaken; The user can work on one or more projects as a part of an epic.'
  )

export type Epic = Omit<z.infer<typeof epicSchema>, 'projects' | 'url'> &
  Partial<{
    url: Url
    projects: Project[]
  }>
