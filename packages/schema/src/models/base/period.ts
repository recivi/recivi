import { z } from 'zod'

import { type Date as RcvDate, dateSchema } from '@/models/base/date'
import type { PartialWithUndefined } from '@/models/utils/partial'
import { primaryRegistry } from '@/registries/primary'

export const periodSchema = z
  .object({
    start: dateSchema.clone().register(primaryRegistry, {
      description: 'the start date of the period',
    }),
    end: dateSchema.optional().register(primaryRegistry, {
      description:
        'the end date of a period; If omitted, the period is considered active in the present.',
    }),
  })
  .register(primaryRegistry, {
    id: 'Period',
    description:
      'a duration of time between a start and end date; For active periods, the end date can be omitted.',
  })

export type Period = Omit<z.infer<typeof periodSchema>, 'start' | 'end'> & {
  start: RcvDate
} & PartialWithUndefined<{ end: RcvDate }>
