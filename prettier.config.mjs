/** @type {import("prettier").Config} */
export default {
  semi: false,
  singleQuote: true,
  astroAllowShorthand: true,
  bracketSameLine: true,
  overrides: [
    {
      files: ['*.astro'],
      options: {
        parser: 'astro',
      },
    },
    {
      files: ['*.svg'],
      options: {
        parser: 'html',
      },
    },
  ],
  proseWrap: 'always',
  plugins: ['prettier-plugin-astro'],
}
