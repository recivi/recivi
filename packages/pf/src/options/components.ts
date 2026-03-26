import { z } from 'astro/zod'

import { getAllComponents } from '../utils/layouts'

// If a component is changed, you should also update `virtual.d.ts`.
const componentNames = [
  'Anchor',
  'Brand',
  'Breadcrumbs',
  'Comms',
  'Elements',
  'Entity',
  'EpicCard',
  'EpicDetails',
  'Footer',
  'Header',
  'Icon',
  'InstituteCard',
  'Letterhead',
  'Nav',
  'NowUpdate',
  'OrgCard',
  'OrgDetails',
  'Period',
  'PfDate',
  'Post',
  'Skill',
  'Table',
  'TechStack',
  'Toc',
] as const
type ComponentName = (typeof componentNames)[number]

// Keep the above list synced with the actual components.
const allComponents = await getAllComponents()
allComponents.forEach((component, idx) => {
  if (componentNames[idx] !== component) {
    throw new Error(`Component names mismatch occurred.`)
  }
})

// `z.object` ensures that every layout named above has an entry. We are not
// using `z.record` because we want to allow missing keys in the input.
export const componentsSchema = z.object(
  Object.fromEntries(
    componentNames.map((name) => [
      name,
      z.string().optional().default(`@recivi/pf/component_defs/${name}.astro`),
    ]),
  ) as Record<ComponentName, z.ZodDefault<z.ZodOptional<z.ZodString>>>,
)
