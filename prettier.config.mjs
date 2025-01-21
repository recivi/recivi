/** @type {import("prettier").Config} */
export default {
  trailingComma: 'es5',
  semi: false,
  singleQuote: true,
  astroAllowShorthand: true,
  bracketSameLine: true,
  singleAttributePerLine: true,
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
