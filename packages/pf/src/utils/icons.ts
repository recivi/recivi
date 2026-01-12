import config from 'virtual:pf/config'

/**
 * Get the SVG content for an icon by its name and optional pack.
 *
 * This function resolves aliases, and strips SVG tags if the content is
 * a full SVG instead of just inner content.
 *
 * @param givenPack the name of the icon pack
 * @param givenName the name of the icon
 * @returns the SVG content as a string, or `undefined` if not found
 */
export function getIconContent(
  givenPack: string | undefined,
  givenName: string,
): string | undefined {
  let pack = givenPack
  let name = givenName

  // If the name is an alias, we must resolve it first.
  const actual = config.icons.aliases[name]
  if (actual) {
    pack = actual.pack ?? givenPack
    name = actual.name
  }

  // If a pack is specified, look only in that pack for the icon.
  if (pack) {
    return config.icons.packs[pack]?.[name]?.body
  }

  // If a pack is not specified, look in all loaded packs for the icon.
  for (const packName in config.icons.packs) {
    const icon = config.icons.packs[packName]?.[name]
    if (icon) {
      return icon.body
    }
  }

  return undefined
}
