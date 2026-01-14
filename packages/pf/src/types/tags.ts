export type MetaTag = {
  content: string
} & ({ property: string } | { name: string })

export type LinkTag = {
  rel: string
  href: string
} & Partial<{
  sizes: string
  type: string
}>
