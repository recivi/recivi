import { z } from 'zod'

import { type Site, siteSchema } from '@/models/bio/site'
import { type Url, urlSchema } from '@/models/base/url'

export const profileSchema = z
  .object({
    site: siteSchema.describe('the website on which the profile is located'),
    username: z
      .optional(z.string())
      .describe('the username or handle of the person on the website'),
    url: urlSchema.describe(
      'the URL to the profile of the person on the website'
    ),
  })
  .describe("a person's profile on a website")

/**
 * Examples:
 *
 * ```json
 * {
 *   "site": {
 *     "name": "Personal"
 *   },
 *   "url": "https://dhruvkb.dev"
 * }
 * ```
 *
 * ---
 *
 * ```json
 * {
 *   "site": {
 *     "id": "bluesky",
 *     "name": "Bluesky",
 *   },
 *   "username": "dhruvkb.dev",
 *   "url": "https://bsky.app/profile/dhruvkb.dev"
 * }
 * ```
 */
export type Profile = Omit<z.infer<typeof profileSchema>, 'site' | 'url'> & {
  site: Site
  url: Url
}
