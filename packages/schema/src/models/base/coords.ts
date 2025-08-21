import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const coordsSchema = z
  .union([
    z
      .object({
        lat: z.literal(90),
        long: z.undefined(),
      })
      .register(primaryRegistry, {
        description: 'the North pole',
      }),
    z
      .object({
        lat: z.literal(-90),
        long: z.undefined(),
      })
      .register(primaryRegistry, {
        description: 'the South pole',
      }),
    z
      .object({
        lat: z.number().gt(-90).lt(90).register(primaryRegistry, {
          description:
            'a measure of distance North (positive) or South (negative) of the Equator (zero degrees)',
        }),
        long: z.number().gt(-180).lte(180).register(primaryRegistry, {
          description:
            'a measure of distance East (positive) or West (negative) of the Prime Meridian (zero degrees)',
        }),
      })
      .register(primaryRegistry, {
        description: 'a non-polar point on the globe',
      }),
  ])
  .register(primaryRegistry, {
    id: 'Coords',
    description:
      'a pair of numbers that uniquely identify a point on the globe',
  })

/**
 * Examples: Refer to tests.
 */
export type Coords = z.infer<typeof coordsSchema>
