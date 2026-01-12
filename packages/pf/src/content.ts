/**
 * This module defines loaders that use Astro's content collections system to
 * read content from various sources.
 */

import { join } from 'node:path'

import { glob, type Loader, type LoaderContext } from 'astro/loaders'
import { z } from 'astro/zod'

/** base schema for all kinds of collection entries */
const baseSchema = z.object({
  title: z.string().describe('the title of the entry'),
  isDraft: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'whether the entry is a draft and should be hidden from the prod site',
    ),
})

/** schema for "Now" updates */
export const nowSchema = baseSchema.extend({
  pubDate: z.date().describe('the publication date of the update'),
})

/** schema for "Blog" posts */
export const blogSchema = baseSchema.extend({
  pubDate: z.date().describe('the publication date of the blog post'),
  description: z.string().describe('a short description of the blog post'),
  categories: z
    .array(z.string())
    .optional()
    .default([])
    .describe('list of categories or tags for the blog post'),
  series: z
    .string()
    .optional()
    .describe('an ongoing series the blog post may belong to'),
})

/** schema for site pages (not a true content collection) */
export const pageSchema = baseSchema
  .extend({
    description: z.string().describe('a short description of the page'),
    navIndex: z
      .number()
      .default(0)
      .describe(
        'the index of the page in site navigation; Use 0 to not show the page in site navigation',
      ),
    banRobots: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'whether search engine robots should be disallowed from indexing the entry',
      ),
    ogTitle: z
      .string()
      .optional()
      .describe(
        'the Open Graph title of the page, if different from the title',
      ),
  })
  .transform((val) => {
    if (!val.ogTitle) {
      return { ...val, ogTitle: val.title }
    }
    return val
  })

/** schema for partial content pieces */
export const partialSchema = z.object({})

/**
 * Get a load function for a given collection name.
 *
 * @param paths the collection's directory under `src/`
 * @returns the function that actually loads the content
 */
function getLoadFn(...paths: string[]): Loader['load'] {
  function load(context: LoaderContext) {
    const { srcDir, root } = context.config

    return glob({
      base: join(srcDir.pathname.replace(root.pathname, ''), ...paths),
      pattern: `**/[^_]*.{md,mdx}`,
    }).load(context)
  }

  return load
}

/**
 * Get a loader for updates that will appear on the "Now" page.
 *
 * @return the content loader for "Now" updates
 */
export function nowLoader(): Loader {
  return { name: 'now', load: getLoadFn('content', 'now') }
}

/**
 * Get a loader for posts that will appear on the "Blog" page.
 *
 * @return the content loader for "Blog" posts
 */
export function blogLoader(): Loader {
  return { name: 'blog', load: getLoadFn('content', 'blog') }
}

/**
 * Get a loader for site pages.
 *
 * @return the content loader for site pages
 */
export function pageLoader(): Loader {
  return { name: 'pages', load: getLoadFn('pages') }
}

/**
 * Get a loader for partial content pieces used on some pages.
 *
 * @returns the content loader for page partials
 */
export function partialLoader(): Loader {
  return { name: 'partials', load: getLoadFn('content', 'partials') }
}

/*
 * TODO: Once Astro migrates to Zod 4, we add loaders for Récivi data.
 * GitHub issue: https://github.com/withastro/astro/issues/14706
 */
