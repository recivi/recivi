export function slugify(input: string): string {
	return (
		input
			// Decompose accented characters.
			.normalize("NFD")
			// Remove accent marks.
			.replaceAll(/[\u0300-\u036F]/gu, "")
			.toLowerCase()
			// Remove non-alphanumeric characters except underscores.
			.replaceAll(/[^a-z0-9_]/gu, "")
			.trim()
			// Replace spaces with underscores.
			.replaceAll(/\s+/gu, "_")
			// Replace multiple underscores with a single one.
			.replaceAll(/_+/gu, "_")
	);
}
