import { z } from 'zod'

import { type Url, urlSchema } from '@/models/base/url'
import { type Site, siteSchema } from '@/models/bio/site'

import { primaryRegistry } from '@/registries/primary'

export const profileSchema = z
  .object({
    site: siteSchema.clone().register(primaryRegistry, {
      description: 'the website on which the profile is located',
    }),
    username: z.string().optional().register(primaryRegistry, {
      description: 'the username or handle of the person on the website',
    }),
    url: urlSchema.clone().register(primaryRegistry, {
      description: 'the URL to the profile of the person on the website',
    }),
  })
  .register(primaryRegistry, {
    id: 'Profile',
    description: "a person's profile on a website",
    examples: [
      {
        site: {
          name: 'Personal',
        },
        url: 'https://dhruvkb.dev',
      },
      {
        site: {
          id: 'bluesky',
          name: 'Bluesky',
        },
        username: 'dhruvkb.dev',
        url: 'https://bsky.app/profile/dhruvkb.dev',
      },
    ],
  })

export type Profile = Omit<z.infer<typeof profileSchema>, 'site' | 'url'> & {
  site: Site
  url: Url
}
