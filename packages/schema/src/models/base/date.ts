import { z } from 'zod'

export const yearSchema = z
  .number()
  .int()
  .min(1)
  .describe('a year in the Gregorian calendar')

export const monthSchema = z
  .number()
  .int()
  .min(1)
  .max(12)
  .describe('a month in the Gregorian calendar')

export const daySchema = z
  .number()
  .int()
  .min(1)
  .max(31)
  .describe('a day in the Gregorian calendar')

/**
 * Verify that the given date is valid. This only verifies that the day
 * can exist for the given combination of month and year. Other range
 * validations are handled by Zod.
 *
 * @param day {number} the day
 * @param month {number} the month
 * @param year {number} the year
 * @returns {boolean} whether the date is valid
 */
function validateDate(day: number, month: number, year?: number): boolean {
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
      .describe('a fully-specified date in the Gregorian calendar'),
    z.tuple([yearSchema]),
    z.tuple([yearSchema, monthSchema]),
    z
      .tuple([yearSchema, monthSchema, daySchema])
      .refine(([year, month, day]) => validateDate(day, month, year)),
  ])
  .describe(
    'a combination of year, month and day; This date can optionally skip the day and month fields, as needed.'
  )

/**
 * Examples: Refer to tests.
 */
export type Date = z.infer<typeof dateSchema>
