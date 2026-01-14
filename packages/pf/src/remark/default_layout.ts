import type { Root } from 'mdast'
import type { VFile } from 'vfile'

/**
 * Set the default layout for pages to be `<Web>`. This is only set if all of
 * the following conditions are met:
 *
 * - The file path is in the `/pages/` directory.
 * - The page is not hidden, i.e. its name does not start with an underscore.
 * - The page contains some frontmatter.
 * - The frontmatter does not have a layout specified.
 *
 * @returns a Remark plugin that sets the default layout in the frontmatter
 */
export function defaultLayout() {
  return (_tree: Root, file: VFile) => {
    const astroData = file.data.astro
    if (
      file.path.includes('/pages/') &&
      !file.basename?.startsWith('_') &&
      astroData?.frontmatter &&
      !astroData.frontmatter.layout
    ) {
      astroData.frontmatter.layout = '@recivi/pf/layouts/Web.astro'
    }
  }
}
