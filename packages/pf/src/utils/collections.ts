import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

import { defineTable } from '../types/table'

/**
 * Check that a given entry from a content collection is not a draft.
 *
 * We rely on Zod to enforce that all content collections have an `isDraft`
 * field in the frontmatter. This function allows drafts in dev mode.
 *
 * @param item the content collection entry to check
 * @returns whether the entry is not a draft or whether we are in dev mode
 */
export function isNotDraft(item: { data: { isDraft?: boolean } }): boolean {
  return !item.data.isDraft || import.meta.env.DEV
}

/**
 * Get a list of categories.
 *
 * This returns a list of unique categories collected from all the non-draft
 * posts from the 'blog' content collection.
 *
 * @returns all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const posts = await getCollection('blog', isNotDraft)
  const categorySet = new Set<string>()
  posts.forEach((post) => {
    post.data.categories.forEach((category) => {
      categorySet.add(category)
    })
  })
  return Array.from(categorySet).toSorted()
}

/**
 * Get the complete data needed to render a table using the `Table` component.
 *
 * @param posts a list of blog posts to include in the table
 * @returns the complete data needed to render a table of blog posts
 */
export function getPostsTable(posts: CollectionEntry<'blog'>[]) {
  return defineTable(
    {
      publish: { title: 'Published', renderer: 'PfDate' },
      post: { title: 'Title & Tags', renderer: 'Post' },
    },
    posts.map((post) => {
      return {
        groupId: post.data.pubDate.getFullYear().toString(),
        data: {
          publish: { date: post.data.pubDate },
          post: { post },
        },
        attrs: {
          'x-data': JSON.stringify({ categories: post.data.categories }),
          'x-bind:class': [
            'activeCategories.length',
            '!categories.some((item) => activeCategories.includes(item))',
            '"inactive"',
          ].join(' && '),
        },
      }
    }),
    'post',
  )
}
