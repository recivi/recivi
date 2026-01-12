import { z } from 'astro/zod'

import { getAllLayouts } from '../utils/layouts'

const layerNames = [
  'props',
  'reset',
  'core',
  'media',
  'universal',
  'components',
  'overrides',
  'utils',
] as const

export const layoutNames = [
  'Blog',
  'Now',
  'Og',
  'Print',
  'Resume',
  'Root',
  'Web',
] as const

// Keep the above list synced with the actual layouts.
const allLayouts = await getAllLayouts()
allLayouts.forEach((layout, idx) => {
  if (layoutNames[idx] !== layout) {
    throw new Error(`Layout names mismatch occurred.`)
  }
})

const customCssSchema = z.record(
  z.enum(layoutNames),
  z.array(z.string()).optional().default([]),
)

export const cssSchema = z
  .object({
    /**
     * the paths to extra CSS files to include in the site; The files must be
     * located in `src/` and paths should be relative to the config file.
     */
    customCss: customCssSchema.optional().default({}),
    /**
     * additional CSS layers to include after the default layers; Use this
     * option to append layers to the default layer order.
     */
    addedLayers: z.array(z.string()).optional(),
    /**
     * the order of the CSS layers; Use this option to completely replace the
     * default layer order.
     */
    layers: z.array(z.string()).optional(),
  })
  .refine(
    (val) => {
      const hasLayers = val.layers !== undefined
      const hasAddedLayers = val.addedLayers !== undefined
      return !(hasLayers && hasAddedLayers)
    },
    { message: 'Cannot specify both `layers` and `addedLayers`.' },
  )
  .transform((val) => {
    const defaultLayers = layerNames.flatMap((layer) => [`pf.${layer}`, layer])

    const { customCss, layers, addedLayers } = val
    if (layers !== undefined) return { customCss, layers }

    if (addedLayers !== undefined)
      return { customCss, layers: [...defaultLayers, ...addedLayers] }

    return { customCss, layers: defaultLayers }
  })
