export function slugify(input: string): string {
  return input
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '') // Remove non-alphanumeric chars except space and hyphen
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with a single one
}
