import { z } from 'zod'

import { type Date, dateSchema } from '@/models/base/date'

export const periodSchema = z
  .object({
    start: dateSchema.describe('the start date of the period'),
    end: z
      .optional(dateSchema)
      .describe(
        'the end date of a period; If omitted, the period is considered active in the present.'
      ),
  })
  .describe(
    'a duration of time between a start and end date; For active periods, the end date can be omitted.'
  )

export type Period = Omit<z.infer<typeof periodSchema>, 'start' | 'end'> & {
  start: Date
  end?: Date
}
