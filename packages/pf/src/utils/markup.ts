/**
 * Remove HTML tags from a string but preserve the textual content.
 *
 * @param input the input string containing HTML tags to strip
 * @returns the input string with HTML tags removed
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<\/?[^>]+(>|$)/g, '')
}

/**
 * Remove the outer `<svg>` opening and closing tags from an SVG string.
 *
 * This is required because the `Icon` component wraps the SVG contents inside
 * its own `<svg>` tag, which is itself because Iconify itself doesn't provide
 * the outer `<svg>` tag in the JSON data.
 *
 * @param svg the input SVG string
 * @returns the SVG string with the `<svg>` and `</svg>` tags stripped
 */
export function innerSvg(svg: string): string {
  return svg.replace(/<\/?svg[^>]*>/g, '')
}
