import config from 'virtual:pf/config'
import projectContext from 'virtual:pf/project-context'
import reciviData from 'virtual:recivi/data'

import type { z } from 'astro/zod'

import type { blogSchema, pageSchema } from '../content'
import type { MetaTag } from '../types/tags'
import {
  fixTrailingSlash,
  pathWithBase,
  pathWithoutBase,
} from './project_context'

/**
 * Get the content for the page's `<title>` tag.
 *
 * This is a concatenation of the page title, delimiter, and site title.
 *
 * @param pageTitle the title of the current page
 * @returns the full page title to be used in the `<title>` tag
 */
export function getFullPageTitle(pageTitle: string) {
  const siteTitle = config.title ?? reciviData.bio.name
  const delimiter = config.titleDelimiter
  return `${pageTitle} ${delimiter} ${siteTitle}`
}

/**
 * Get a list of `<meta>` tag attribute objects common to all pages.
 *
 * @param frontmatter the frontmatter for the page or blog post
 * @param site the site URL from the Astro config
 * @param page the URL of the current page
 * @returns the list of `<meta>` tag attribute objects
 */
export function getCommonMetaTags(
  frontmatter:
    | Pick<z.infer<typeof pageSchema>, 'title' | 'description'>
    | Pick<z.infer<typeof blogSchema>, 'title' | 'description'>,
  site: URL | undefined,
  page: URL,
): MetaTag[] {
  const tags: MetaTag[] = [
    { name: 'description', content: frontmatter.description },
  ]

  // Open Graph
  tags.push(
    { property: 'og:description', content: frontmatter.description },
    { property: 'og:title', content: getFullPageTitle(frontmatter.title) },
    { property: 'og:site_name', content: config.title ?? reciviData.bio.name },
    { property: 'og:locale', content: config.locale.bcp47 },
  )

  if (site) {
    // Canonical URL and Open Graph images need knowledge of the site.
    tags.push(
      { property: 'og:url', content: page.href },
      getOgImage(page),
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
    )
  }

  return tags
}

/**
 * Get a list of `<meta>` tag attribute objects for the website pages.
 *
 * @param frontmatter the frontmatter for the page or blog post
 * @param site the site URL from the Astro config
 * @param page the URL of the current page
 * @returns the list of `<meta>` tag attribute objects
 */
export function getWebsiteMetaTags(
  frontmatter: z.infer<typeof pageSchema>,
): MetaTag[] {
  const tags: MetaTag[] = []
  if (frontmatter.banRobots)
    tags.push({ name: 'robots', content: 'noindex, nofollow' })
  return tags
}

/**
 * Get a list of `<meta>` tag attribute objects for the article pages.
 *
 * @param frontmatter the frontmatter for the page or blog post
 * @param site the site URL from the Astro config
 * @param page the URL of the current page
 * @returns the list of `<meta>` tag attribute objects
 */
export function getArticleMetaTags(
  frontmatter: z.infer<typeof blogSchema>,
): MetaTag[] {
  const tags: MetaTag[] = [
    { property: 'og:type', content: 'article' },
    {
      property: 'article:published_time',
      content: frontmatter.pubDate.toISOString(),
    },
  ]
  return tags
}

/**
 * Get a list of `<meta>` tag attribute objects for theme colors.
 *
 * @returns the list of `<meta>` tag attribute objects
 */
export function getThemeMetaTags(): MetaTag[] {
  return Object.entries(config.theme.color).map(([media, color]) => ({
    name: 'theme-color',
    content: color,
    media: `(prefers-color-scheme: ${media})`,
  }))
}

/**
 * Get the URL of Open Graph image for the given page URL.
 *
 * @param page the URL of the page to map to the Open Graph image URL
 * @returns the URL to the Open Graph image
 */
function getOgImage(page: URL): MetaTag {
  let { pathname } = page
  pathname = pathWithoutBase(projectContext, pathname)
  if (pathname === '/') {
    pathname = '/index'
  } else {
    pathname = fixTrailingSlash({ trailingSlash: 'never' }, pathname)
  }
  let ogPathname = `og${pathname}.png`
  ogPathname = pathWithBase(projectContext, ogPathname)
  const ogUrl = new URL(ogPathname, page)
  return { property: 'og:image', content: ogUrl.href }
}
