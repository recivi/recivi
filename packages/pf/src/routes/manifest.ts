import { getEntry } from 'astro:content'
import config from 'virtual:pf/config'
import projectContext from 'virtual:pf/project-context'
import reciviData from 'virtual:recivi/data'

import type { APIRoute } from 'astro'

import { pathWithBase, publicFileExists } from '../utils/project_context'

export const GET: APIRoute = async () => {
  const { base } = projectContext
  const indexPage = await getEntry('pages', 'index')

  const icons = (
    await Promise.all(
      [192, 512].map(async (size) => {
        const exists = await publicFileExists(
          projectContext,
          `icon-${size}.png`,
        )
        return { size, exists }
      }),
    )
  )
    .filter(({ exists }) => exists)
    .map(({ size }) => ({
      src: pathWithBase(projectContext, `icon-${size}.png`),
      sizes: `${size}x${size}`,
      type: 'image/png',
    }))

  return new Response(
    JSON.stringify({
      name: config.title ?? reciviData.bio.name,
      shortName: config.title ?? reciviData.bio.name,
      display: 'standalone',
      description: indexPage?.data.description ?? '',
      start_url: base,
      icons,
    }),
  )
}
