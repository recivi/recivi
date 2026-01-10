import assert from 'node:assert'
import { suite, test } from 'node:test'

import { ZodError } from 'zod'

import { coordsSchema } from '@/models/base/coords'

void suite('coordsSchema', () => {
  const validCoords = [
    ['allows null island', { lat: 0, long: 0 }],
    ['allows 180th meridian', { lat: 0, long: 180 }],
    ['allows undefined longitude at North pole', { lat: 90, long: undefined }],
    ['allows undefined longitude at South pole', { lat: -90, long: undefined }],
    ['allows specific coords', { lat: 19.0647, long: 73.0112 }],
  ] as const
  validCoords.forEach(([name, coords]) => {
    void test(name, () => {
      coordsSchema.parse(coords)
    })
  })

  const invalidCoords = [
    ['disallows -180 longitude', { lat: 0, long: -180 }],
    ['disallows numeric longitude at North pole', { lat: 90, long: 0 }],
    ['disallows numeric longitude at South pole', { lat: -90, long: 0 }],
  ] as const
  invalidCoords.forEach(([name, coords]) => {
    void test(name, () => {
      assert.throws(() => {
        coordsSchema.parse(coords)
      }, ZodError)
    })
  })
})
