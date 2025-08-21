import { z } from 'zod'

import { primaryRegistry } from '@/registries/primary'

export const tagSchema = z.string().register(primaryRegistry, {
  id: 'Tag',
  description:
    'a string that classifies a given entity; The usage of a tag is entirely up to the application.',
  examples: ['programming', 'recivi/portfolio'],
})

export type Tag = z.infer<typeof tagSchema>
