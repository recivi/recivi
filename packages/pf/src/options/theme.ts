import { z } from 'astro/zod'

const hexColorSchema = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

const colorSchema = z
  .union([
    /** a single hex color code for light/dark themes */
    hexColorSchema,
    /** a CSS color name */
    z.object({
      /** the hex color code for the light theme */
      light: hexColorSchema,
      /** the hex color code for the dark theme */
      dark: hexColorSchema,
    }),
  ])
  .transform((val) => {
    if (typeof val === 'string') {
      return { light: val, dark: val }
    }
    return val
  })

export const themeSchema = z.object({
  /** color to set as the theme via `<meta>` tags */
  color: colorSchema.optional().default({
    light: '#eff1f5',
    dark: '#1e1e2e',
  }),
})
