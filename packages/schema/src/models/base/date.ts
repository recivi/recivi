import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const yearSchema = z.number().int().min(1).register(primaryRegistry, {
  id: 'Year',
  description: 'a year in the Gregorian calendar',
})

export const monthSchema = z
  .number()
  .int()
  .min(1)
  .max(12)
  .register(primaryRegistry, {
    id: 'Month',
    description: 'a month in the Gregorian calendar',
  })

export const daySchema = z
  .number()
  .int()
  .min(1)
  .max(31)
  .register(primaryRegistry, {
    id: 'Day',
    description: 'a day of the month in the Gregorian calendar',
  })

/**
 * Verify that the given date is valid. This only verifies that the day
 * can exist for the given combination of month and year. Other range
 * validations are handled by Zod.
 *
 * @param day the day
 * @param month the month
 * @param year the year
 * @returns {boolean} whether the date is valid
 */
function validateDate(day: number, month: number, year: number): boolean {
  if ([4, 6, 9, 11].includes(month) && day > 30) return false

  const isLeapYear = (year: number) =>
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
  const febLimit = year && !isLeapYear(year) ? 28 : 29
  if (month === 2 && day > febLimit) return false

  return true
}

export const dateSchema = z
  .union([
    z
      .object({
        year: yearSchema,
        month: monthSchema,
        day: daySchema,
      })
      .refine(({ year, month, day }) => validateDate(day, month, year))
      .register(primaryRegistry, {
        description: 'a fully-specified date in the Gregorian calendar',
        examples: [{ year: 1970, month: 1, day: 1 }],
      }),
    z.tuple([yearSchema]).register(primaryRegistry, {
      description: 'a date consisting only of a year',
      examples: [[1970]],
    }),
    z.tuple([yearSchema, monthSchema]).register(primaryRegistry, {
      description: 'a date consisting of a year and a month',
      examples: [[1970, 1]],
    }),
    z
      .tuple([yearSchema, monthSchema, daySchema])
      .refine(([year, month, day]) => validateDate(day, month, year))
      .register(primaryRegistry, {
        description:
          'a date consisting of a year, a month and a day of the month',
        examples: [[1970, 1, 1]],
      }),
  ])
  .register(primaryRegistry, {
    id: 'Date',
    description:
      'a combination of year, month and day; This date can optionally skip the day and month fields, as needed.',
  })

/**
 * Examples: Refer to tests.
 */
export type Date = z.infer<typeof dateSchema>
