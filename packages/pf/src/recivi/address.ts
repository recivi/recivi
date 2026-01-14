import type { Address } from '@recivi/schema'

/**
 * Convert a given country code into the country's flag emoji. This is easier
 * than mapping it to a country name, considering there can be multiple
 * representations of the name.
 *
 * @param countryCode the ISO 3166-1 Alpha-2 code for the country
 * @returns the flag emoji
 */
function getCountryDisplay(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

/**
 * Convert the address into a string.
 *
 * @param address the address to stringify
 * @returns the string representation of the address
 */
export function getAddressDisplay(address: Address): string {
  let text = getCountryDisplay(address.countryCode)
  if (address.state) {
    text = `${address.state}, ${text}`
  }
  if (address.city) {
    text = `${address.city}, ${text}`
  }
  return text
}
