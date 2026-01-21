import pf from '@recivi/pf'
import { innerSvg } from '@recivi/pf/utils/markup'
import { defineConfig } from 'astro/config'

import starlightSvg from './src/assets/icons/starlight.svg?raw'

export default defineConfig({
  /*
   * It's recommend to set this to a domain only with no subpath.
   *
   * If this setting is not provided, the meta tags for canonical URL and Open
   * Graph images will not be generated.
   *
   * More info: https://docs.astro.build/en/reference/configuration-reference/#site
   */
  // site: '',

  /*
   * A leading slash is always added automatically, so it's recommended to add
   * one and eliminate the confusion.
   *
   * The `trailingSlash` setting can modify the base to match.
   *
   * More info: https://docs.astro.build/en/reference/configuration-reference/#base
   */
  // base: '/'

  /*
   * This setting is confusing because for pre-rendered sites (like Récivi PF),
   * the final behavior (including possible redirects) is determined by the
   * hosting provider, based on its own rules for directories, files and
   * extensions. It's recommended to leave this setting as is.
   *
   * More info: https://docs.astro.build/en/reference/configuration-reference/#trailingslash
   */
  // trailingSlash: 'ignore',

  build: {
    /*
     * It's recommended to leave this setting as is.
     *
     * More info: https://docs.astro.build/en/reference/configuration-reference/#buildformat
     */
    // format: 'directory',
  },

  devToolbar: { enabled: false },
  markdown: { smartypants: false }, // https://daringfireball.net/projects/smartypants/
  integrations: [
    // Récivi PF integration
    pf({
      /*
       * If you would like to use different Récivi data files for development
       * and production, you can use `import.meta.env.DEV` to conditionally
       * specify them here.
       */
      reciviDataFile: 'https://github.com/dhruvkb/recivi/raw/main/recivi.json',
      icons: {
        packs: {
          // See an example of custom icons usage on the "Colophon" page.
          custom: {
            starlight: { body: innerSvg(starlightSvg) },
          },
        },
        aliases: {
          // Some brands have Lucide icons, which we don't like.
          github: { pack: 'simple-icons', name: 'github' },
          linkedin: { pack: 'simple-icons', name: 'linkedin' },
          instagram: { pack: 'simple-icons', name: 'instagram' },
        },
      },
    }),
  ],
})
