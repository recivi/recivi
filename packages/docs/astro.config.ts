import { defineConfig } from 'astro/config'

import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    starlight({
      title: 'Récivi',
      favicon: '/favicon.ico',
      logo: {
        light: './src/assets/logo_light.svg',
        dark: './src/assets/logo_dark.svg',
      },
      social: {
        github: 'https://github.com/recivi/recivi',
      },
      sidebar: [
        {
          label: 'About',
          items: ['about/why', 'about/introduction', 'about/contributing'],
        },
      ],
      customCss: ['./src/styles/catppuccin.css'],
    }),
  ],
})
