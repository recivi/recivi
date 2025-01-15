import { z } from 'zod'

export const tagSchema = z
  .string()
  .describe('a string that classifies a given entity')

export type Tag = z.infer<typeof tagSchema>
