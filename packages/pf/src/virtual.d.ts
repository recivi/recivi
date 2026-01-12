/*
 * This file contains TypeScript types for virtual modules provided by
 * the Récivi PF Astro integration. The contents of these modules are
 * defined in the `index.ts` file.
 */

declare module 'virtual:pf/config' {
  const Options: import('./options').ParsedOptions
  export default Options
}
