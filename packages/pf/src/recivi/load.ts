import { readFile } from 'node:fs/promises'

import { type Resume, resumeSchema } from '@recivi/schema'

import { isUrl } from '../utils/paths'

/**
 * Load the Récivi-compliant résumé data file either from a location on
 * the filesystem or a remote URL.
 *
 * @param source the local file path or URL to load data from
 * @returns the loaded and parsed Récivi-compliant resume data
 */
export async function loadReciviData(source: string): Promise<Resume> {
  const text = isUrl(source)
    ? await fetch(source).then((res) => res.text())
    : await readFile(source, { encoding: 'utf-8' })
  return resumeSchema.parse(JSON.parse(text))
}
