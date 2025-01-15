import { z } from 'zod'

import { type Date, dateSchema } from '@/models/base/date'
import { type Period, periodSchema } from '@/models/base/period'
import { type Tag, tagSchema } from '@/models/base/tag'

export const certSchema = z
  .object({
    id: z.string().optional().describe('an identifier for the certificate'),
    name: z.string().describe('the name of the certificate'),
    field: z
      .string()
      .optional()
      .describe('the field of study in which the certificate was obtained'),
    period: periodSchema.describe('the period of study for the certificate'),
    issue: dateSchema.describe('the date on which the certificate was issued'),
    shortName: z
      .string()
      .optional()
      .describe(
        'a short informal name for the certificate. This can be an abbreviation.'
      ),
    score: z
      .string()
      .optional()
      .describe(
        'the score achieved in the certificate examination; This is the overall score (cumulative) for the complete certificate. E.g., "86", "3.9" or "B-".'
      ),
    maxScore: z
      .string()
      .optional()
      .describe(
        'the maximum attainable score in the certificate examination; E.g., "100", "4.0" or "A+".'
      ),
    courses: z
      .array(z.string())
      .optional()
      .describe(
        'a list of courses completed to obtain the certificate; E.g., "CS50 - Introduction to Computer Science"'
      ),
    expiration: dateSchema
      .optional()
      .describe(
        'the date on which the certificate is set to become invalid; This is to be left blank if the certificate does not expire.'
      ),
    tags: z
      .array(tagSchema)
      .optional()
      .describe(
        'tags to apply to this certificate; The use of tags is left up to the application (for example, the portfolio uses tags for PDF résumés).'
      ),
  })
  .describe(
    'a document that proves successful completion of a course of education or training'
  )

/**
 * Examples:
 *
 * ```json
 * {
 *   "id": "b_tech",
 *   "name": "Bachelor of Technology",
 *   "shortName": "B. Tech.",
 *   "field": "Engineering Physics",
 *   "period": {
 *     "start": [2015],
 *     "end": [2019]
 *   },
 *   "score": "7.286",
 *   "maxScore": "10.000",
 *   "courses": [
 *     "PH101 - Introduction to Physics",
 *   ]
 * }
 * ```
 */
export type Cert = Omit<
  z.infer<typeof certSchema>,
  'period' | 'issue' | 'expiration' | 'tags'
> & {
  period: Period
  issue: Date
} & Partial<{
    expiration: Date
    tags: Tag[]
  }>
