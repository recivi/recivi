import type { AstroIntegration } from 'astro'
import colors from 'piccolore'

const { green } = colors

type Params = Parameters<
  NonNullable<AstroIntegration['hooks']['astro:server:setup']>
>[0]

/**
 * Watch the given résumé data file for changes and restart the Astro server when it changes.
 *
 * @param watchPath the path to the résumé data file to watch
 * @param server the Astro development server
 * @param logger the Astro logger
 */
export function watchDatafile(
  watchPath: string,
  server: Params['server'],
  logger: Params['logger'],
) {
  logger.info(green('watching for data file changes...'))

  let restartTimeout: NodeJS.Timeout | undefined = undefined
  server.watcher.on('change', (path) => {
    if (path !== watchPath) return

    if (restartTimeout) {
      clearTimeout(restartTimeout)
    }
    restartTimeout = setTimeout(() => {
      logger.info('Résumé data file changed. Restarting...')
      server.watcher.unwatch(watchPath)
      void server.restart()
    }, 1000)
  })
  server.watcher.add(watchPath)
}
