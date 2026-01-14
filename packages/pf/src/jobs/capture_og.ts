import { mkdir, rm } from 'node:fs/promises'

import { type AstroIntegration, preview } from 'astro'
import colors from 'piccolore'
import puppeteer from 'puppeteer'

import type { ProjectContext } from '../types/project_context'
import { fixTrailingSlash, pathWithBase } from '../utils/project_context'

const { bgGreen, blue, black, green, yellow, dim } = colors

type Params = Parameters<
  NonNullable<AstroIntegration['hooks']['astro:build:done']>
>[0]

export async function captureOgImages(
  projectContext: ProjectContext,
  dir: Params['dir'],
  pages: Params['pages'],
  logger: Params['logger'],
) {
  logger.info(bgGreen(black(' generating Open Graph images ')))

  // Start Astro preview server.
  const server = await preview({ logLevel: 'error' })
  const baseUrl = `http://${server.host ?? 'localhost'}:${server.port}`

  // Prepare Puppeteer.
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({ width: 600, height: 315, deviceScaleFactor: 2 })

  for (const { pathname } of pages) {
    if (!pathname.startsWith('og_render/')) continue

    const fixedPathname = fixTrailingSlash(
      projectContext,
      pathWithBase(projectContext, pathname),
    )
    const url = `${baseUrl}${fixedPathname}`
    logger.info(`${blue('▶')} ${url}`)

    // Open the OG image rendering page via Puppeteer.
    await page.goto(url, { waitUntil: 'networkidle0' })
    const bodyEl = await page.waitForSelector('body')
    if (!bodyEl) {
      logger.warn(`  ${yellow('└─ skipped')}: no <body>`)
      continue
    }

    const screenshotPath = new URL(
      `${fixTrailingSlash({ trailingSlash: 'never' }, pathname.replace('og_render', 'og'))}.png`,
      dir,
    )

    await mkdir(new URL('.', screenshotPath), { recursive: true }) // Ensure directory exists.
    await bodyEl.screenshot({
      path: screenshotPath.pathname,
    })
    logger.info(`  ${blue('└─')} ${dim(screenshotPath.pathname)}`)
  }
  // Delete the `og_render` directory.
  await rm(new URL('og_render/', dir), { recursive: true, force: true })

  logger.info(green('✓ Completed.'))

  // Clean up.
  await browser.close()
  await server.stop()
}
