import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  markdown: {
    smartypants: false, // https://daringfireball.net/projects/smartypants/
  },
  integrations: [
    starlight({
      title: 'Récivi',
      favicon: '/favicon.ico',
      logo: {
        light: './src/assets/logo_light.svg',
        dark: './src/assets/logo_dark.svg',
      },
      expressiveCode: {
        themes: ['catppuccin-mocha', 'catppuccin-latte'],
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/recivi/recivi',
        },
      ],
      sidebar: [
        {
          label: 'About',
          items: [
            'about/why',
            'about/introduction',
            'about/contributing',
            'about/comparison',
          ],
        },
        {
          label: 'Schema',
          items: [
            {
              label: 'Guides',
              items: [
                'schema/guides/writing_data_files',
                'schema/guides/validating_data_files',
              ],
            },
            {
              label: 'Reference',
              autogenerate: { directory: 'schema/reference' },
              collapsed: true,
            },
          ],
        },
        {
          label: 'PF',
          items: [
            {
              label: 'Guides',
              items: ['pf/guides/building_a_portfolio', 'pf/guides/how_to'],
            },
            {
              label: 'Reference',
              autogenerate: { directory: 'pf/reference' },
              collapsed: true,
            },
          ],
        },
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 6 },
      customCss: ['./src/styles/brand.css', './src/styles/layout.css'],
      components: {
        Footer: './src/components/Footer.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
    }),
  ],
})
