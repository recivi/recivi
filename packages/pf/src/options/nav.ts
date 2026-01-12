import { z } from 'astro/zod'

const slugString = z.string().refine((val) => val.includes('{slug}'), {
  message: 'Must contain the "{slug}" placeholder.',
})

export const navSchema = z.object({
  dynamicPages: z
    .object({
      /** the URL template for post pages; Use "{slug}" as a placeholder. */
      blogPost: slugString.optional().default('/blog/posts/{slug}'),
      /** the URL template for epic pages; Use "{slug}" as a placeholder. */
      resumeEpic: slugString.optional().default('/resume/epics/{slug}'),
      /** the URL template for org pages; Use "{slug}" as a placeholder. */
      resumeOrg: slugString.optional().default('/resume/orgs/{slug}'),
    })
    .default({}),
})
