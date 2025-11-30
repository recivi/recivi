import { z } from 'zod'

import { dateSchema, type Date as RcvDate } from '@/models/base/date'
import { type Period, periodSchema } from '@/models/base/period'
import { type Tag, tagSchema } from '@/models/base/tag'
import type { PartialWithUndefined } from '@/models/utils/partial'

import { primaryRegistry } from '@/registries/primary'

export const certSchema = z
  .object({
    id: z.string().optional().register(primaryRegistry, {
      description: 'an identifier for the certificate',
    }),
    name: z.string().register(primaryRegistry, {
      description: 'the name of the certificate',
    }),
    field: z.string().optional().register(primaryRegistry, {
      description: 'the field of study in which the certificate was obtained',
    }),
    period: periodSchema.clone().register(primaryRegistry, {
      description: 'the period of study for the certificate',
    }),
    issue: dateSchema.clone().register(primaryRegistry, {
      description: 'the date on which the certificate was issued',
    }),
    shortName: z.string().optional().register(primaryRegistry, {
      description:
        'a short informal name for the certificate. This can be an abbreviation.',
    }),
    score: z
      .string()
      .optional()
      .register(primaryRegistry, {
        description:
          'the score achieved in the certificate examination; This is the overall score (cumulative) for the complete certificate.',
        examples: ['86', '3.9', 'B-'],
      }),
    maxScore: z
      .string()
      .optional()
      .register(primaryRegistry, {
        description:
          'the maximum attainable score in the certificate examination',
        examples: ['100', '4.0', 'A+'],
      }),
    courses: z
      .array(z.string())
      .optional()
      .default([])
      .register(primaryRegistry, {
        description: 'a list of courses completed to obtain the certificate',
        examples: [
          [
            'CS50 - Introduction to Computer Science',
            'PH101 - Introduction to Physics',
          ],
        ],
      }),
    expiration: dateSchema.optional().register(primaryRegistry, {
      description:
        'the date on which the certificate is set to become invalid; This is to be left blank if the certificate does not expire.',
    }),
    tags: z.array(tagSchema).optional().default([]).register(primaryRegistry, {
      description:
        'tags to apply to this certificate; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).',
    }),
  })
  .register(primaryRegistry, {
    id: 'Cert',
    description:
      'a document that proves successful completion of a course of education or training',
    examples: [
      {
        id: 'b_tech',
        name: 'Bachelor of Technology',
        shortName: 'B. Tech.',
        field: 'Engineering Physics',
        period: {
          start: [2015],
          end: [2019],
        },
        issue: [2015],
        score: '7.286',
        maxScore: '10.000',
        courses: ['PH101 - Introduction to Physics'],
      },
    ],
  })

export type Cert = Omit<
  z.infer<typeof certSchema>,
  'period' | 'issue' | 'expiration' | 'tags'
> & {
  period: Period
  issue: RcvDate
} & {
  tags: Tag[]
} & PartialWithUndefined<{
    expiration: RcvDate
  }>
