import { defineConfig } from 'astro/config'

import starlight from '@astrojs/starlight'

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
          label: 'Guides',
          items: [
            'guides/writing_data_files',
            'guides/validating_data_files',
            'guides/building_a_portfolio',
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
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
