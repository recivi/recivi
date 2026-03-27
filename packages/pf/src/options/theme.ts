import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'

const hexColorSchema = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

const colorSchema = z
  .union([
    /** a single hex color code for light/dark themes */
    hexColorSchema,
    /** a CSS color name */
    z.object({
      /** the hex color code for the light theme */
      light: hexColorSchema.register(primaryRegistry, {
        description: 'the hex color code for the light theme',
      }),
      /** the hex color code for the dark theme */
      dark: hexColorSchema.register(primaryRegistry, {
        description: 'the hex color code for the dark theme',
      }),
    }),
  ])
  .transform((val) => {
    if (typeof val === 'string') {
      return { light: val, dark: val }
    }
    return val
  })
  .register(primaryRegistry, {
    id: 'color',
    description:
      'a color value, either a single hex code or separate light/dark hex codes',
  })

export const themeSchema = z
  .object({
    /** color to set as the theme via `<meta>` tags */
    color: colorSchema
      .optional()
      .default({
        light: '#eff1f5',
        dark: '#1e1e2e',
      })
      .register(primaryRegistry, {
        description: 'color to set as the theme via `<meta>` tags',
      }),
  })
  .register(primaryRegistry, {
    id: 'theme',
    description: "the site's theme settings",
  })
