import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'

const slugString = z.string().refine((val) => val.includes('{slug}'), {
  message: 'Must contain the "{slug}" placeholder.',
})

export const navSchema = z
  .object({
    dynamicPages: z
      .object({
        /** the URL template for post pages; This should include the "{slug}" placeholder. */
        blogPost: slugString
          .optional()
          .default('/blog/posts/{slug}')
          .register(primaryRegistry, {
            description:
              'the URL template for post pages; This should include the "{slug}" placeholder.',
          }),
        /** the URL template for epic pages; This should include the "{slug}" placeholder. */
        resumeEpic: slugString
          .optional()
          .default('/resume/epics/{slug}')
          .register(primaryRegistry, {
            description:
              'the URL template for epic pages; This should include the "{slug}" placeholder.',
          }),
        /** the URL template for organisation pages; This should include the "{slug}" placeholder. */
        resumeOrg: slugString
          .optional()
          .default('/resume/orgs/{slug}')
          .register(primaryRegistry, {
            description:
              'the URL template for organisation pages; This should include the "{slug}" placeholder.',
          }),
      })
      .prefault({})
      .register(primaryRegistry, {
        description: 'the URL templates for dynamic pages',
      }),
  })
  .register(primaryRegistry, {
    id: 'nav',
    description: "the site's navigation settings",
  })
