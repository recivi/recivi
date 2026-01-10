// Note that globs should not overlap as they can lead to race conditions.
export default {
  'examples/schema/*.json': [
    // Runs formatter, linter and import sorting to the requested files.
    'prettier --write',
    'pnpm -F schema validate',
  ],
  '*.{js,ts,astro}': ['eslint --fix', 'prettier --write'],
  '*.{css,html,json,md,mdx,svg,yml}': ['prettier --write'],
}
