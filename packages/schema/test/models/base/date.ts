import { suite, test } from 'node:test'
import assert from 'node:assert'

import { ZodError } from 'zod'

import { dateSchema } from '@/models/base/date'

suite('dateSchema with tuple', () => {
  const dateTuples = [
    ['allows length 1 with year', [2020]],
    ['allows length 2 with year and month', [2020, 12]],
    ['allows length 3 with year, month, and day', [2020, 12, 31]],
  ] as const
  dateTuples.forEach(([name, date]) => {
    test(name, () => {
      dateSchema.parse(date)
    })
  })

  const dateInvalidRange = [
    ['disallows year < 1', [0]],
    ['disallows months < 1', [2020, 0]],
    ['disallows months > 12', [2020, 13]],
    ['disallows days < 1', [2020, 12, 0]],
    ['disallows days > 31', [2020, 12, 32]],
  ] as const
  dateInvalidRange.forEach(([name, date]) => {
    test(name, () => {
      assert.throws(() => {
        dateSchema.parse(date)
      }, ZodError)
    })
  })

  const invalidDates = [
    ['disallows 31 days in 30-day month', [2020, 4, 31]],
    ['disallows 30 February in leap year', [2020, 2, 30]],
    ['disallows 29 February in non-leap year', [2021, 2, 29]],
  ] as const
  invalidDates.forEach(([name, date]) => {
    test(name, () => {
      assert.throws(() => {
        dateSchema.parse(date)
      }, ZodError)
    })
  })
})

suite('dateSchema with object', () => {
  const dateInvalidRange = [
    ['disallows year < 1', { year: 0, month: 12, day: 31 }],
    ['disallows months < 1', { year: 2020, month: 0, day: 31 }],
    ['disallows months > 12', { year: 2020, month: 13, day: 31 }],
    ['disallows days < 1', { year: 2020, month: 12, day: 0 }],
    ['disallows days > 31', { year: 2020, month: 12, day: 32 }],
  ] as const
  dateInvalidRange.forEach(([name, date]) => {
    test(name, () => {
      assert.throws(() => {
        dateSchema.parse(date)
      }, ZodError)
    })
  })

  const invalidDates = [
    ['disallows 31 days in 30-day month', { year: 2020, month: 4, day: 31 }],
    ['disallows 30 February in leap year', { year: 2020, month: 2, day: 30 }],
    [
      'disallows 29 February in non-leap year',
      { year: 2021, month: 2, day: 29 },
    ],
  ] as const
  invalidDates.forEach(([name, date]) => {
    test(name, () => {
      assert.throws(() => {
        dateSchema.parse(date)
      }, ZodError)
    })
  })
})
