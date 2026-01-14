import config from 'virtual:pf/config'

/**
 * Convert a JS `Date` instance to Récivi's date format. This returns
 * the object form of the date, as JS dates always include all the
 * necessary components.
 *
 * @param date the `Date` instance to convert
 * @returns the Récivi representation of the given date
 */
export function jsDateToRcvDate(date: Date): [number, number, number] {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

/**
 * Get the readable representation for a given date. The goal of the readable
 * date is to be clear and complete and locale-appropriate.
 *
 * @param year the year part of the date
 * @param month the month part of the date
 * @param day the day part of the date
 * @returns the readable date
 */
export function getReadableDate(
  year: number,
  month: number | undefined,
  day: number | undefined,
): string {
  const dateObj = new Date(year, (month ?? 1) - 1, day ?? 1)
  return Intl.DateTimeFormat(config.locale.bcp47, {
    year: 'numeric',
    month: month ? 'long' : undefined,
    day: day ? 'numeric' : undefined,
  }).format(dateObj)
}

/**
 * Get the display parts for a given date. The goal of the display date is to be
 * visually consistent and so it uses ISO 8601.
 *
 * @param year the year part of the date
 * @param month the month part of the date
 * @param day the day part of the date
 * @returns the array of string parts for the displayed date
 */
export function getDisplayDate(
  year: number,
  month: number | undefined,
  day: number | undefined,
): (string | undefined)[] {
  const dateObj = new Date(year, (month ?? 1) - 1, day ?? 1)
  const parts = Intl.DateTimeFormat(config.locale.bcp47, {
    year: 'numeric',
    month: month ? '2-digit' : undefined,
    day: day ? '2-digit' : undefined,
  }).formatToParts(dateObj)
  const keys = ['year', 'month', 'day']
  return keys.map((key) => parts.find((part) => part.type === key)?.value)
}
