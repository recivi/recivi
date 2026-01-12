import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Get a list of all files in the given directory inside `src/`.
 *
 * @param dir the directory inside `src/`
 * @returns the list of files
 */
function getSrcFiles(dir: string) {
  const resolvedDir = resolve(import.meta.filename, '../../', dir)
  return readdir(resolvedDir)
}

/**
 * Get a list of all Astro files (without the `.astro` extension) in the given
 * directory inside `src/`.
 *
 * @param dir the directory inside `src/`
 * @returns the list of Astro files without the extension
 */
async function getAstroFiles(dir: string) {
  const allFiles = await getSrcFiles(dir)
  return allFiles
    .filter((file) => file.endsWith('.astro'))
    .map((file) => file.replace(/\.astro$/, ''))
    .sort()
}

/**
 * Get a list of all layout names from Astro files in the `layouts` directory.
 *
 * @returns the list of layout names
 */
export function getAllLayouts() {
  return getAstroFiles('layouts')
}

/**
 * Get a list of all component names from Astro files in the `component_defs`
 * directory.
 *
 * @returns the list of component names
 */
export function getAllComponents() {
  return getAstroFiles('component_defs')
}
