import { defineCollection } from 'astro:content'

import {
  blogLoader,
  blogSchema,
  nowLoader,
  nowSchema,
  pageLoader,
  pageSchema,
  partialLoader,
  partialSchema,
} from '@recivi/pf/content'

const now = defineCollection({
  loader: nowLoader(),
  schema: nowSchema,
})
const blog = defineCollection({
  loader: blogLoader(),
  schema: blogSchema,
})
const partials = defineCollection({
  loader: partialLoader(),
  schema: partialSchema,
})
const pages = defineCollection({
  loader: pageLoader(),
  schema: pageSchema,
})

export const collections = { now, blog, partials, pages }
