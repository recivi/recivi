/**
 * This file is not referenced anywhere and not imported anywhere. It exists
 * solely to define Astro content collections and silence TypeScript problems.
 */

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
} from './content'

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
