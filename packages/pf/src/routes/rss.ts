import { getCollection, getEntry } from 'astro:content'
import config from 'virtual:pf/config'
import projectContext from 'virtual:pf/project-context'
import resumeData from 'virtual:recivi/data'

import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Cannot generate RSS unless `site` is configured.')
  }

  const title = config.title ?? resumeData.bio.name
  const description =
    (await getEntry('pages', config.pages.blog.slug))?.data.description ?? ''

  const items = (await getCollection('blog')).map((post) => {
    const data = post.data
    const slug = post.id.substring(5)
    return {
      title: data.title,
      description: data.description,
      pubDate: data.pubDate,
      link: config.nav.dynamicPages.blogPost.replace('{slug}', slug),
    }
  })

  return rss({
    site,
    title,
    description,
    items,
    trailingSlash: projectContext.trailingSlash !== 'never',
  })
}
