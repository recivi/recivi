import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'

const tagSchema = z
  .object({
    /** the name of the tag */
    tag: z.string().register(primaryRegistry, {
      description: 'the name of the tag',
    }),
    /** a mapping of attribute names and values for the tag */
    attrs: z
      .record(z.string(), z.union([z.string(), z.boolean()]).optional())
      .optional()
      .default({})
      .register(primaryRegistry, {
        description: 'a mapping of attribute names and values for the tag',
      }),
    /** the inner HTML content of the tag */
    content: z.string().optional().register(primaryRegistry, {
      description: 'the inner HTML content of the tag',
    }),
  })
  .register(primaryRegistry, {
    id: 'tag',
    description: 'an HTML tag to include in the document head',
  })

export const headSchema = z
  .object({
    /** a list of arbitrary elements to include in the document `<head>` */
    elements: z
      .array(tagSchema)
      .optional()
      .default([])
      .register(primaryRegistry, {
        description:
          'a list of arbitrary elements to include in the document `<head>`',
      }),
  })
  .register(primaryRegistry, {
    id: 'head',
    description: 'the additional elements in the document `<head>`',
  })
