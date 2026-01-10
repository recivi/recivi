// Note that globs should not overlap as they can lead to race conditions.
export default {
  'examples/schema/*.json': [
    // Runs formatter, linter and import sorting to the requested files.
    'biome check --write --no-errors-on-unmatched',
    'pnpm -F schema validate',
  ],
  '*.{js,ts,astro}': [
    // Runs formatter, linter and import sorting to the requested files.
    'biome check --write --no-errors-on-unmatched',
  ],
  '*.{css,html,md,mdx,pcss,svg,yml}': [
    // Runs formatter, linter and import sorting to the requested files.
    'biome check --write --no-errors-on-unmatched',
  ],
}
