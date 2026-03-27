import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'

export const faviconSchema = z
  .object({
    /** whether to automatically identify and use favicons on the site */
    isEnabled: z.boolean().optional().default(true).register(primaryRegistry, {
      description:
        'whether to automatically identify and use favicons on the site',
    }),
    /** alternate file names for various favicon files; The ICO file name is fixed as a de facto standard. */
    fileNames: z
      .object({
        /** the name with extension of the Apple touch icon */
        appleTouchIcon: z
          .string()
          .optional()
          .default('apple-touch-icon.png')
          .register(primaryRegistry, {
            description: 'the name with extension of the Apple touch icon',
          }),
        /** the name with extension of the SVG version of the favicon */
        faviconSvg: z
          .string()
          .optional()
          .default('favicon.svg')
          .register(primaryRegistry, {
            description:
              'the name with extension of the SVG version of the favicon',
          }),
        /** the prefix used by manifest icons */
        manifestIconsPrefix: z
          .string()
          .optional()
          .default('icon-')
          .register(primaryRegistry, {
            description: 'the prefix used by manifest icons',
          }),
      })
      .optional()
      .prefault({})
      .register(primaryRegistry, {
        description:
          'alternate file names for various favicon files; The ICO file name is fixed as a de facto standard.',
      }),
  })
  .register(primaryRegistry, {
    id: 'favicon',
    description: "the site's favicon settings",
  })
