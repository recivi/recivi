import { z, type GlobalMeta } from 'zod'

export interface PrimaryMeta extends Omit<GlobalMeta, 'examples'> {
  examples?: z.$input[] | undefined
}

export const primaryRegistry = z.registry<PrimaryMeta>()
