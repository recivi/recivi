// Note that globs should not overlap as they can lead to race conditions.
export default {
  'packages/schema/examples/*.json': [
    'prettier --write',
    'pnpm -F schema validate',
  ],
  '*.{js,ts,astro}': ['eslint --fix', 'prettier --write'],
  '*.{css,html,md,mdx,pcss,svg,yml}': ['prettier --write'],
}
