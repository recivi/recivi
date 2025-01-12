/** @type {import("prettier").Config} */
module.exports = {
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
