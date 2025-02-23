import { z } from 'zod'

export const siteSchema = z
  .object({
    id: z
      .optional(z.string())
      .describe(
        'a slug for the site; In implementations, this can be used as a key to find the icon for the site.'
      ),
    name: z
      .string()
      .describe(
        "the readable name of the site, as it should be displayed to users; This should follow the site's preferred punctuation and capitalization."
      ),
  })
  .describe(
    JSON.stringify({
      description:
        'a web platform on which a person can have a profile; This can be a professional website or social network.',
      examples: [
        {
          id: 'github',
          name: 'GitHub',
        },
        {
          name: 'Personal',
        },
      ],
    })
  )

export type Site = z.infer<typeof siteSchema>
