import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'
import { componentsSchema } from './components'
import { cssSchema } from './css'
import { faviconSchema } from './favicon'
import { headSchema } from './head'
import { iconsSchema } from './icons'
import { localeSchema } from './locale'
import { navSchema } from './nav'
import { pagesSchema } from './pages'
import { resumePdfSchema } from './resume_pdf'
import { themeSchema } from './theme'

/*
 * We use TS comments instead of `describe()` because they can be picked
 * up by IDEs in `astro.config.ts`.
 */
export const optionsSchema = z
  .object({
    /**
     * the path or URL to the Récivi-compliant résumé data file; If the path is a
     * local file, it can be a path relative to the config file or an absolute
     * path on the filesystem.
     */
    reciviDataFile: z.string().register(primaryRegistry, {
      description:
        'the path or URL to the Récivi-compliant résumé data file; If the path is a local file, it can be a path relative to the config file or an absolute path on the filesystem.',
    }),

    /** the title of the site, to override the name from the résumé data file */
    title: z.string().optional().register(primaryRegistry, {
      description:
        'the title of the site, to override the name from the résumé data file',
    }),

    /** the character to use between page and site title */
    titleDelimiter: z
      .string()
      .optional()
      .default('|')
      .register(primaryRegistry, {
        description: 'the character to use between page and site title',
      }),

    /** whether to give credit to Récivi in the site footer */
    showCredits: z
      .boolean()
      .optional()
      .default(true)
      .register(primaryRegistry, {
        description: 'whether to give credit to Récivi in the site footer',
      }),

    /** the site's language settings */
    locale: localeSchema
      .optional()
      .default({ bcp47: 'en' })
      .register(primaryRegistry, {
        description: "the site's language settings",
      }),

    /** the site's icon settings */
    icons: iconsSchema.optional().prefault({}).register(primaryRegistry, {
      description: "the site's icon settings",
    }),

    /** the site's favicon settings */
    favicon: faviconSchema.optional().prefault({}).register(primaryRegistry, {
      description: "the site's favicon settings",
    }),

    /** the PDF generation settings for the résumé */
    resumePdf: resumePdfSchema
      .optional()
      .prefault({})
      .register(primaryRegistry, {
        description: 'the PDF generation settings for the résumé',
      }),

    /** the site's navigation settings */
    nav: navSchema.optional().prefault({}).register(primaryRegistry, {
      description: "the site's navigation settings",
    }),

    /** the site's theme settings */
    theme: themeSchema.optional().prefault({}).register(primaryRegistry, {
      description: "the site's theme settings",
    }),

    /** the additional elements in the document <head> */
    head: headSchema.optional().prefault({}).register(primaryRegistry, {
      description: 'the additional elements in the document <head>',
    }),

    /** the site's CSS customizations */
    css: cssSchema.optional().prefault({}).register(primaryRegistry, {
      description: "the site's CSS customizations",
    }),

    /** the settings for the included pages */
    pages: pagesSchema.optional().prefault({}).register(primaryRegistry, {
      description: 'the settings for the included pages',
    }),

    /** the custom component overrides for the site */
    components: componentsSchema
      .optional()
      .prefault({})
      .register(primaryRegistry, {
        description: 'the custom component overrides for the site',
      }),
  })
  .register(primaryRegistry, {
    id: 'Options',
    description: 'the configuration of a Récivi portfolio site',
  })

export type Options = z.input<typeof optionsSchema>
export type ParsedOptions = z.output<typeof optionsSchema>
