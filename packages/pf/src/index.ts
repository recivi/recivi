/**
 * These triple-slash directives defines dependencies to various declaration files that will be
 * loaded when a user imports the PF integration in their Astro configuration file. These
 * directives must be first at the top of the file and can only be preceded by this comment
 */
/// <reference path="./virtual.d.ts"/>

import mdx from '@astrojs/mdx'
import type { AstroIntegration } from 'astro'
import { addVirtualImports } from 'astro-integration-kit'
import colors from 'piccolore'

import { captureOgImages } from './jobs/capture_og'
import { watchDatafile } from './jobs/watch_datafile'
import { type Options, optionsSchema, type ParsedOptions } from './options'
import { layoutNames } from './options/css'
import { loadReciviData } from './recivi/load'
import { defaultLayout } from './remark/default_layout'
import type { ProjectContext } from './types/project_context'
import { getAbsolutePath, isLocalFile } from './utils/paths'
import { publicFileExists } from './utils/project_context'

const { blue } = colors

/**
 * Set up the Récivi PF Astro integration with the given configuration.
 *
 * @param options the configuration options for the integration
 * @returns the configured instance of the Astro integration
 */
export default function (options: Options): AstroIntegration {
  const parsedOptions: ParsedOptions = optionsSchema.parse(options)

  // Declare variables that store state across hooks.
  let configRoot: URL
  let projectContext: ProjectContext

  // In case of a restart, the `astro:server:setup` hook is called twice.
  let isWatchingDatafile = false

  return {
    name: '@recivi/pf',
    hooks: {
      'astro:config:setup': async (params) => {
        params.logger.debug(`${blue('astro:config:setup')} hook called`)

        // Preserve config root for use in other hooks.
        configRoot = params.config.root

        // Preserve project context for use in other hooks.
        const { site, base, trailingSlash, root, srcDir, publicDir, build } =
          params.config
        const hasManifestIcons = await Promise.all(
          [192, 512].map((size) => {
            const prefix = parsedOptions.favicon.fileNames.manifestIconsPrefix
            return publicFileExists({ publicDir }, `${prefix}${size}.png`)
          }),
        ).then((results) => results.some(Boolean))
        projectContext = {
          site,
          base,
          trailingSlash,
          root,
          srcDir,
          publicDir,
          build,
          hasManifestIcons,
        }

        // Load résumé data file.
        let { reciviDataFile } = parsedOptions
        if (isLocalFile(reciviDataFile)) {
          reciviDataFile = getAbsolutePath(reciviDataFile, configRoot)
          params.logger.info(`Using local résumé data file: ${reciviDataFile}`)
        } else {
          params.logger.info(`Using remote résumé data file: ${reciviDataFile}`)
        }
        const reciviData = await loadReciviData(reciviDataFile)

        // Inject routes.
        if (projectContext.site) {
          // Add a route to handle all Open Graph image requests.
          params.injectRoute({
            pattern: 'og_render/[...path]',
            entrypoint: '@recivi/pf/routes/og_render.astro',
          })
          params.injectRoute({
            pattern: 'rss.xml',
            entrypoint: '@recivi/pf/routes/rss.ts',
          })
        }
        if (
          parsedOptions.favicon.isEnabled &&
          projectContext.hasManifestIcons
        ) {
          // Inject the manifest route if 192px or 512px icons are present.
          params.injectRoute({
            pattern: 'manifest.webmanifest',
            entrypoint: '@recivi/pf/routes/manifest.ts',
          })
        }

        // Make useful information globally available via virtual modules.
        addVirtualImports(params, {
          name: '@recivi/pf',
          imports: {
            'virtual:pf/config': `export default ${JSON.stringify(parsedOptions)}`,
            'virtual:pf/project-context': `export default ${JSON.stringify(projectContext)}`,
            'virtual:recivi/data': `export default ${JSON.stringify(reciviData)}`,

            // Each layout gets its own virtual module for custom CSS.
            ...Object.fromEntries(
              layoutNames.map((layoutName) => [
                `virtual:pf/custom-css/${layoutName}`,
                parsedOptions.css.customCss[layoutName]
                  ?.map((file) => `import '${file}';`)
                  .join('\n') ?? '',
              ]),
            ),

            // Imports from this virtual module will automatically resolve to
            // user-substituted components or fall back to PF components.
            'virtual:pf/components': Object.entries(parsedOptions.components)
              .map(
                ([name, path]) =>
                  `export { default as ${name} } from '${path}';`,
              )
              .join('\n'),
          },
        })

        // Make changes to the Astro configuration itself.
        params.updateConfig({
          markdown: {
            shikiConfig: {
              themes: {
                light: 'catppuccin-latte', // Match the default props.
                dark: 'catppuccin-mocha', // Match the default props.
              },
            },
            remarkPlugins: [defaultLayout],
          },
          integrations: [
            // Ensure PF's MDX integration is included.
            mdx({ optimize: true }),
          ],
        })
      },
      'astro:server:setup': (params) => {
        params.logger.debug(`${blue('astro:server:setup')} hook called`)

        let { reciviDataFile } = parsedOptions
        if (isLocalFile(reciviDataFile) && !isWatchingDatafile) {
          // Watch local résumé data file for changes.
          reciviDataFile = getAbsolutePath(reciviDataFile, configRoot)
          watchDatafile(reciviDataFile, params.server, params.logger)
          isWatchingDatafile = true
        }
      },
      'astro:build:done': async (params) => {
        params.logger.debug(`${blue('astro:build:done')} hook called`)

        // Generate Open Graph images.
        if (projectContext.site) {
          await captureOgImages(
            projectContext,
            params.dir,
            params.pages,
            params.logger,
          )
        }
      },
    },
  }
}
