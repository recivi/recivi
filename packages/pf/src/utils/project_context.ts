/*
 * These functions do not import `projectContext` from virtual modules because
 * they are used in `index.ts` before the virtual modules have been defined.
 */

import { stat } from 'node:fs/promises'

import type { ProjectContext } from '../types/project_context'

/**
 * Check if a file with the given name exists in the public directory.
 *
 * @param filename the name of the file to check for existence
 * @returns whether the file exists in the public directory
 */
export async function publicFileExists(
  projectContext: Pick<ProjectContext, 'publicDir'>,
  filename: string,
): Promise<boolean> {
  try {
    await stat(new URL(filename, projectContext.publicDir))
    return true
  } catch {
    return false
  }
}

/**
 * Remove the `base` path from the given path.
 *
 * This function ensures that the remaining path has a leading slash.
 *
 * @param path the path to remove the base from
 * @returns the path without the base prefix
 */
export function pathWithoutBase(
  projectContext: Pick<ProjectContext, 'base'>,
  path: string,
): string {
  const { base } = projectContext
  let remaining = path
  if (remaining.startsWith(base)) {
    remaining = remaining.substring(base.length)
  }
  return remaining.startsWith('/') ? remaining : `/${remaining}`
}

/**
 * Prefix the `base` path to the given path.
 *
 * This function can handle the presence or absence of a trailing slash in the
 * base path.
 *
 * @param path the path to prefix with the base
 * @returns the path prefixed with the base
 */
export function pathWithBase(
  projectContext: Pick<ProjectContext, 'base'>,
  path: string,
): string {
  const { base } = projectContext
  if (base.endsWith('/')) {
    return `${base}${path}`
  } else {
    return `${base}/${path}`
  }
}

/**
 * Normalize the trailing slash based on the `trailingSlash` setting.
 *
 * If `trailingSlash` is
 * - 'always', ensure the path ends with a slash
 * - 'never', ensure the path does not end with a slash
 * - 'ignore', leave the path unchanged
 *
 * It is possible to get the same path back if it is already normal.
 *
 * @param path the path whose trailing slash needs to be fixed
 * @returns the path with the correct trailing slash
 */
export function fixTrailingSlash(
  projectContext: Pick<ProjectContext, 'trailingSlash'>,
  path: string | URL,
): string {
  const { trailingSlash } = projectContext

  const pathStr = path.toString()
  if (trailingSlash === 'always' && !pathStr.endsWith('/')) {
    return `${pathStr}/`
  }
  if (trailingSlash === 'never' && pathStr.endsWith('/')) {
    return pathStr.slice(0, -1)
  }
  return pathStr
}
