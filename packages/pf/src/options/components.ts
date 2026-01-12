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

type ComponentPaths = Record<ComponentName, string>

export const componentsSchema = z
  .record(z.enum(componentNames), z.string())
  .optional()
  .default({})
  .transform((val): ComponentPaths => {
    const defaultValues = Object.fromEntries(
      componentNames.map((name) => [
        name,
        `@recivi/pf/component_defs/${name}.astro`,
      ]),
    ) as ComponentPaths
    return { ...defaultValues, ...val }
  })
