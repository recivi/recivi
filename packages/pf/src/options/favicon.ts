import { z } from 'astro/zod'

export const faviconSchema = z.object({
  /**
   * whether to automatically identify and use favicons on the site; Setting
   * this to `false` disables favicon detection.
   */
  isEnabled: z.boolean().optional().default(true),
  /** specify alternate file names for various favicon files; The ICO file name
   * cannot be changed as it is a de facto standard.
   */
  fileNames: z
    .object({
      /** the name with extension of the Apple touch icon */
      appleTouchIcon: z.string().optional().default('apple-touch-icon.png'),
      /** the name with extension of the SVG version of the favicon */
      faviconSvg: z.string().optional().default('favicon.svg'),
      /** the prefix used by manifest icons */
      manifestIconsPrefix: z.string().optional().default('icon-'),
    })
    .optional()
    .default({}),
})
