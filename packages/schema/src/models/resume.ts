import { z } from 'zod'

import { type Bio, bioSchema } from '@/models/bio/bio'
import { type Epic, epicSchema } from '@/models/creations/epic'
import { type Institute, instituteSchema } from '@/models/education/institute'
import { type Language, languageSchema } from '@/models/languages/language'
import { type Skill, skillSchema } from '@/models/skills/skill'
import { type Org, orgSchema } from '@/models/work/org'

import { primaryRegistry } from '@/registries/primary'

export const resumeSchema = z
  .object({
    $schema: z
      .url()
      .optional()
      .default('https://recivi.pages.dev/schemas/recivi-resume.json')
      .register(primaryRegistry, {
        description:
          'the URL to the JSON schema that should be used to validate this document',
      }),
    bio: bioSchema.clone().register(primaryRegistry, {
      description: 'the identity and personal information of a person',
    }),
    creations: z
      .array(epicSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description:
          'the creations of a person, which consists of projects under various epics',
      }),
    education: z
      .array(instituteSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description:
          'the education of a person, which consists of certifications from various insitutes',
      }),
    work: z.array(orgSchema).optional().default([]).register(primaryRegistry, {
      description:
        'the work experience of a person, which consists of positions of responsibility in various organisations',
    }),
    skills: z
      .array(skillSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of skills that the person has',
      }),
    languages: z
      .array(languageSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of languages that the person can work with',
      }),
  })
  .register(primaryRegistry, {
    id: 'Resume',
    description:
      'comprehensive information, both personal and professional, about a person; This is the root of the Récivi schema.',
  })

export type Resume = Omit<
  z.infer<typeof resumeSchema>,
  'bio' | 'creations' | 'education' | 'work' | 'skills' | 'languages'
> & {
  bio: Bio
  creations: Epic[]
  education: Institute[]
  work: Org[]
  skills: Skill[]
  languages: Language[]
}
