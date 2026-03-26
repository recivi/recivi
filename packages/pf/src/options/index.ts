import { z } from 'astro/zod'

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
export const optionsSchema = z.object({
  /**
   * the path or URL to the Récivi-compliant résumé data file; If the path is a
   * local file, it can be a path relative to the config file or an absolute
   * path on the filesystem.
   */
  reciviDataFile: z.string(),

  /** the title of the site, to override the name from the résumé data file */
  title: z.string().optional(),

  /** the character to use between page and site title */
  titleDelimiter: z.string().optional().default('|'),

  /** whether to give credit to Récivi in the site footer */
  showCredits: z.boolean().optional().default(true),

  /** configuration for the site's language */
  locale: localeSchema.optional().default({ bcp47: 'en' }),

  /** configuration to use icons in the site */
  icons: iconsSchema.optional().prefault({}),

  /** configuration for favicons in the site */
  favicon: faviconSchema.optional().prefault({}),

  /** configuration for generating a print-friendly résumé PDF */
  resumePdf: resumePdfSchema.optional().prefault({}),

  /** configuration for navigation within the site */
  nav: navSchema.optional().prefault({}),

  /** options for theming the site */
  theme: themeSchema.optional().prefault({}),

  /** options for adding elements to the document `<head>` */
  head: headSchema.optional().prefault({}),

  /** options for customizing the site's CSS */
  css: cssSchema.optional().prefault({}),

  /** configuration for included pages */
  pages: pagesSchema.optional().prefault({}),

  /** custom component overrides */
  components: componentsSchema.optional().prefault({}),
})

export type Options = z.input<typeof optionsSchema>
export type ParsedOptions = z.output<typeof optionsSchema>
