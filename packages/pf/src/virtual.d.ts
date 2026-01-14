/*
 * This file contains TypeScript types for virtual modules provided by
 * the Récivi PF Astro integration. The contents of these modules are
 * defined in the `index.ts` file.
 */

// If a component is changed, you should also update `models/components.ts`.
declare module 'virtual:pf/components' {
  export const Anchor: typeof import('./component_defs/Anchor.astro').default
  export const Brand: typeof import('./component_defs/Brand.astro').default
  export const Breadcrumbs: typeof import('./component_defs/Breadcrumbs.astro').default
  export const Comms: typeof import('./component_defs/Comms.astro').default
  export const Elements: typeof import('./component_defs/Elements.astro').default
  export const Entity: typeof import('./component_defs/Entity.astro').default
  export const EpicCard: typeof import('./component_defs/EpicCard.astro').default
  export const EpicDetails: typeof import('./component_defs/EpicDetails.astro').default
  export const Footer: typeof import('./component_defs/Footer.astro').default
  export const Header: typeof import('./component_defs/Header.astro').default
  export const Icon: typeof import('./component_defs/Icon.astro').default
  export const InstituteCard: typeof import('./component_defs/InstituteCard.astro').default
  export const Letterhead: typeof import('./component_defs/Letterhead.astro').default
  export const Nav: typeof import('./component_defs/Nav.astro').default
  export const NowUpdate: typeof import('./component_defs/NowUpdate.astro').default
  export const OrgCard: typeof import('./component_defs/OrgCard.astro').default
  export const OrgDetails: typeof import('./component_defs/OrgDetails.astro').default
  export const Period: typeof import('./component_defs/Period.astro').default
  export const PfDate: typeof import('./component_defs/PfDate.astro').default
  export const Post: typeof import('./component_defs/Post.astro').default
  export const Skill: typeof import('./component_defs/Skill.astro').default
  export const Table: typeof import('./component_defs/Table.astro').default
  export const TechStack: typeof import('./component_defs/TechStack.astro').default
  export const Toc: typeof import('./component_defs/Toc.astro').default
}

declare module 'virtual:pf/config' {
  const Options: import('./options').ParsedOptions
  export default Options
}
