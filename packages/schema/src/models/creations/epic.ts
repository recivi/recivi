import { z } from 'zod'

import { type Url, urlSchema } from '@/models/base/url'
import { type Project, projectSchema } from '@/models/creations/project'
import type { PartialWithUndefined } from '@/models/utils/partial'

import { primaryRegistry } from '@/registries/primary'

export const epicSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description:
        'an identifier for the epic; In implementations, this can be used as a key to find the logo for the epic.',
    }),
    name: z.string().register(primaryRegistry, {
      description: 'the name of the epic',
    }),
    url: urlSchema.optional().register(primaryRegistry, {
      description:
        'the public facing URL to access this epic homepage; This should be a place where more information about the epic can be found.',
    }),
    summary: z.string().optional().register(primaryRegistry, {
      description:
        'a short description or introduction of the epic; This is used where space is limited such as a résumé.',
    }),
    description: z.string().optional().register(primaryRegistry, {
      description:
        'long-form description of the epic; This is used where space is not constrained.',
    }),
    projects: z
      .array(projectSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of projects that are part of this epic',
      }),
  })
  .register(primaryRegistry, {
    id: 'Epic',
    description:
      'a large creative endeavour that the user has undertaken; The user can work on one or more projects as a part of an epic.',
  })

export type Epic = Omit<z.infer<typeof epicSchema>, 'projects' | 'url'> & {
  projects: Project[]
} & PartialWithUndefined<{
    url: Url
  }>
