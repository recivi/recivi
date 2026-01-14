import config from 'virtual:pf/config'

/**
 * Combine the array of strings into a single string for display.
 *
 * For the English locale, this joins items with ", ", except for the last two
 * items, which are joined with ", and ".
 *
 * @param array the array of strings to combine
 * @returns the string representation of the array
 */
export function getArrayDisplay(array: string[]): string {
  return new Intl.ListFormat(config.locale.bcp47, {
    style: 'long',
    type: 'conjunction', // means "and"
  }).format(array)
}
