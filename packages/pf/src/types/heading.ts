/**
 * The name of an HTML heading element. Astro only accepts a literal tag name
 * where a component is expected, so dynamically built heading tags must be
 * narrowed to this type.
 */
export type HtmlHeading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
