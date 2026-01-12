import { fileURLToPath } from 'node:url'

/**
 * Determine if the given text is a URL.
 *
 * This is a rudimentary check that considers text starting with
 * "http://" or "https://" as URLs.
 *
 * @param text the text to check for being a URL
 * @returns whether the text is a URL
 */
export function isUrl(text: string): boolean {
  return /^https?:\/\//.test(text)
}

/**
 * Determine if the given text is a local file path.
 *
 * Any text which is not a URL is considered a local file path.
 *
 * @param text the text to check for being a local file path
 * @returns whether the text is a local file path
 */
export function isLocalFile(text: string): boolean {
  return !isUrl(text)
}

/**
 * Make the given path absolute based on the provided base directory.
 *
 * @param path the path to make absolute
 * @param base the base directory from where to resolve relative paths
 * @returns the absolute path
 */
export function getAbsolutePath(path: string, base: URL): string {
  if (path.startsWith('/')) {
    // Path is already absolute, so no change is needed.
    return path
  }
  return fileURLToPath(new URL(path, base))
}
