import { z } from 'zod'

export const coordsSchema = z
  .union([
    z
      .object({
        lat: z.union([
          z.literal(90).describe('North pole'),
          z.literal(-90).describe('South pole'),
        ]),
        long: z
          .undefined()
          .describe('longitude must be undefined at the poles'),
      })
      .describe('a point at the North or South pole'),
    z
      .object({
        lat: z
          .number()
          .gt(-90)
          .lt(90)
          .describe(
            'a measure of distance North (positive) or South (negative) of the Equator (zero degrees)'
          ),
        long: z
          .number()
          .gt(-180)
          .lte(180)
          .describe(
            'a measure of distance East (positive) or West (negative) of the Prime Meridian (zero degrees)'
          ),
      })
      .describe('a non-polar point on the globe'),
  ])
  .describe(
    'a tuple of two numbers that uniquely identify a point on the globe'
  )

/**
 * Examples: See tests.
 */
export type Coords = z.infer<typeof coordsSchema>
