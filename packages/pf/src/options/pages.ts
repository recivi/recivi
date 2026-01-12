import { z } from 'astro/zod'

const nowSchema = z.object({
  /** number of entries to show on the "Now" page */
  numEntries: z.number().optional().default(3),

  /**
   * a URL to where older "Now" updates can be found; Leave this blank if you
   * want older updates to become unreachable.
   */
  archiveUrl: z.string().optional(),
})

const blogSchema = z.object({
  /**
   * whether to show category filter on the blog index page; This feature
   * requires JavaScript.
   */
  showCategories: z.boolean().optional().default(true),
})

const resumeSchema = z.object({
  /** whether to show the "Education" section */
  showEducation: z.boolean().optional().default(true),

  /** whether to show the "Work experience" section */
  showWork: z.boolean().optional().default(true),

  /** whether to show the "Creations" section */
  showCreations: z.boolean().optional().default(true),

  /** whether to show the "Skills" section */
  showSkills: z.boolean().optional().default(true),

  /** whether to show the "Languages" section */
  showLanguages: z.boolean().optional().default(true),
})

export const pagesSchema = z.object({
  /** configuration for the "Now" page */
  now: nowSchema.optional().default({}),

  /** configuration for the "Blog" page */
  blog: blogSchema.optional().default({}),

  /** configuration for the "Résumé" page */
  resume: resumeSchema.optional().default({}),
})
