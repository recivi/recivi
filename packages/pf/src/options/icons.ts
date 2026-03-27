import { icons as iconsLucide } from '@iconify-json/lucide'
import { icons as iconsSi } from '@iconify-json/simple-icons'
import { z } from 'astro/zod'

import { primaryRegistry } from '../registries/primary'
import { innerSvg } from '../utils/markup'

export const iconsSchema = z
  .object({
    /**
     * whether to show icons on the site; Setting this to `false`
     * converts the `Icon` component into a no-op.
     */
    isEnabled: z.boolean().optional().default(true).register(primaryRegistry, {
      description:
        'whether to show icons on the site; Setting this to `false` converts the `Icon` component into a no-op.',
    }),
    /**
     * a record of custom icon packs to use; You can use Iconify icons
     * as the value of this record.
     */
    packs: z
      .record(
        /** the name of the icon pack */
        z.string(),
        z.record(
          /** the name of the icon */
          z.string(),
          /** the contents of the icon */
          z.object({
            /** the SVG body of the icon */
            body: z.string().register(primaryRegistry, {
              description: 'the SVG body of the icon',
            }),
          }),
        ),
      )
      .optional()
      .default({})
      .register(primaryRegistry, {
        description:
          'a record of custom icon packs to use; You can use Iconify icons as the value of this record.',
      }),
    /** a record of icon aliases to use */
    aliases: z
      .record(
        /** the alias name for the icon */
        z.string(),
        /** the reference for the actual icon to show */
        z.object({
          /** the name the icon pack */
          pack: z.string().optional().register(primaryRegistry, {
            description: 'the name of the icon pack',
          }),
          /** the name of the icon */
          name: z.string().register(primaryRegistry, {
            description: 'the name of the icon',
          }),
        }),
      )
      .optional()
      .default({})
      .register(primaryRegistry, {
        description: 'a record of icon aliases to use',
      }),
  })
  .register(primaryRegistry, {
    id: 'icons',
    description: 'configuration to use icons in the site',
  })
  .transform((val) => {
    if (!('lucide' in val.packs)) {
      val.packs.lucide = iconsLucide.icons
    }
    if (!('simple-icons' in val.packs)) {
      val.packs['simple-icons'] = iconsSi.icons
    }
    if (!('pf' in val.packs)) {
      const reciviSvg = import.meta.glob('../assets/icons/recivi.svg', {
        as: 'raw',
        eager: true,
      })['../assets/icons/recivi.svg'] as string
      val.packs.pf = { recivi: { body: innerSvg(reciviSvg) } }
    }
    return val
  })
