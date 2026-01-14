import { icons as iconsLucide } from '@iconify-json/lucide'
import { icons as iconsSi } from '@iconify-json/simple-icons'
import { z } from 'astro/zod'

import reciviSvg from '../assets/icons/recivi.svg?raw'
import { innerSvg } from '../utils/markup'

export const iconsSchema = z
  .object({
    /**
     * whether to show icons on the site; Setting this to `false`
     * converts the `Icon` component into a no-op.
     */
    isEnabled: z.boolean().optional().default(true),
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
            body: z.string(),
          }),
        ),
      )
      .optional()
      .default({}),
    /** a record of icon aliases to use */
    aliases: z
      .record(
        /** the alias name for the icon */
        z.string(),
        /** the reference for the actual icon to show */
        z.object({
          /** the name the icon pack */
          pack: z.string().optional(),
          /** the name of the icon */
          name: z.string(),
        }),
      )
      .optional()
      .default({}),
  })
  .transform((val) => {
    if (!('lucide' in val.packs)) {
      val.packs.lucide = iconsLucide.icons
    }
    if (!('simple-icons' in val.packs)) {
      val.packs['simple-icons'] = iconsSi.icons
    }
    if (!('pf' in val.packs)) {
      val.packs.pf = { recivi: { body: innerSvg(reciviSvg) } }
    }
    return val
  })
