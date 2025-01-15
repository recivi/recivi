// Note that globs should not overlap as they can lead to race conditions.
export default {
  '*.{js,ts,astro}': ['eslint --fix', 'prettier --write'],
  '*.{css,html,json,md,mdx,pcss,svg,yml}': ['prettier --write'],
}
