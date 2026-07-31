/**
 * This module provides pure display functions for transforming Récivi schema
 * types into human-readable strings.
 *
 * These are shared across all renderers.
 */

// Import from the barrel file.
import type {
	Address,
	Date,
	LanguageProficiency,
	Period,
	RoleLocation,
	RoleType,
	Skill,
	Tag,
	Url,
} from "@/index";
import { urlDest, dateParts } from "@/utils";

// Dates
// =====

/**
 * Format a Récivi date as a readable string, using only the
 * components that are present.
 *
 * @param date the Récivi date to format
 * @param bcp47 the BCP 47 locale tag for formatting
 * @param options options for formatting the date
 * @returns the formatted date string
 */
export function formatDate(
	date: Date,
	bcp47 = "en",
	options: { usage?: "display" | "reading" } = {},
): string {
	const { usage = "display" } = options;

	const formatStyle =
		usage === "display"
			? ({
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				} as const)
			: ({
					year: "numeric",
					month: "long",
					day: "numeric",
				} as const);

	const [year, month, day] = dateParts(date);
	const dateObj = new globalThis.Date(year, (month ?? 1) - 1, day ?? 1);
	return Intl.DateTimeFormat(bcp47, {
		year: formatStyle.year,
		month: month ? formatStyle.month : undefined,
		day: day ? formatStyle.day : undefined,
	}).format(dateObj);
}

/**
 * Format a period as "start – end" or "start – present" if
 * the end date is omitted.
 *
 * @param period the period to format
 * @param bcp47 the BCP 47 locale tag for formatting dates
 * @returns the formatted period string
 */
export function formatPeriod(
	period: Period,
	bcp47 = "en",
	options: { usage?: "display" | "reading" } = {},
): string {
	const start = formatDate(period.start, bcp47, options);
	const end = period.end ? formatDate(period.end, bcp47, options) : "Present";
	return `${start} – ${end}`;
}

// URLs
// ====

/**
 * Get the clean, readable version of a URL.
 *
 * For most URLs, this means stripping the protocol and the "www." prefix, if
 * present. For telephone and WhatsApp links, we make an attempt to get the
 * label which may be a better-formatted version.
 *
 * @param url the Récivi `Url` to format
 * @returns the readable URL string
 */
export function urlReadableDest(url: Url): string {
	const dest = urlDest(url);
	if (["tel:", "wa.me"].some((sub) => dest.includes(sub)) && typeof url !== "string")
		return url.label;

	const { label } =
		/(https?:\/\/|mailto:|tel:)(www\.)?(wa\.me\/)?(?<label>.*)/u.exec(dest)?.groups ?? {};
	if (label) return label;

	return "link";
}

// Addresses
// =========

/**
 * Convert a given country code into the country's flag emoji.
 *
 * @param countryCode the ISO 3166-1 Alpha-2 code for the country
 * @returns the flag emoji
 */
export function countryFlag(countryCode: string): string {
	return countryCode.toUpperCase().replaceAll(/./gu, (char) => {
		const codePoint = char.codePointAt(0);
		if (codePoint === undefined) return char;
		return String.fromCodePoint(codePoint + 127397);
	});
}

/**
 * Convert an address into a display string with city, state
 * and a flag emoji for the country.
 *
 * @param address the address to format
 * @param options options for formatting the address
 * @returns the formatted address string
 */
export function formatAddress(address: Address, options: { useFlag?: boolean } = {}): string {
	const { useFlag = true } = options;
	let text = address.countryCode;
	if (useFlag) {
		text = countryFlag(text);
	}
	if (address.state) {
		text = `${address.state}, ${text}`;
	}
	if (address.city) {
		text = `${address.city}, ${text}`;
	}
	return text;
}

// Enums
// =====

const ROLE_TYPE_DISPLAYS: Record<RoleType, string> = {
	"full-time": "Full-time",
	"part-time": "Part-time",
	contract: "Contract",
	internship: "Internship",
	freelance: "Freelance",
	foss: "FOSS",
	volunteer: "Volunteer",
	temp: "Temporary",
	other: "Other",
};

/**
 * Get the display label for a role type.
 *
 * @param roleType the role type enum value
 * @returns the human-readable label
 */
export function formatRoleType(roleType: RoleType): string {
	return ROLE_TYPE_DISPLAYS[roleType];
}

const ROLE_LOCATION_DISPLAYS: Record<RoleLocation, string> = {
	remote: "Remote",
	onsite: "On-site",
	hybrid: "Hybrid",
};

/**
 * Get the display label for a role location.
 *
 * @param roleLocation the role location enum value
 * @returns the human-readable label
 */
export function formatRoleLocation(roleLocation: RoleLocation): string {
	return ROLE_LOCATION_DISPLAYS[roleLocation];
}

const LANGUAGE_PROFICIENCY_DISPLAYS: Record<LanguageProficiency, string> = {
	no: "",
	not_possible: "",
	elementary: "Elementary",
	limited_working: "Limited working",
	professional_working: "Professional working",
	full_professional: "Full professional",
	native: "Native",
};

/**
 * Get the display label for a language proficiency level.
 *
 * @param proficiency the proficiency enum value
 * @returns the human-readable label
 */
export function formatProficiency(proficiency: LanguageProficiency): string {
	return LANGUAGE_PROFICIENCY_DISPLAYS[proficiency];
}

// Tags
// ====

/**
 * Check whether a tagged entity should be included in the
 * output. Returns true if no filter tag is set, or if the
 * entity's tags contain the filter tag.
 *
 * @param tags the tags on the entity
 * @param filterTag the tag to filter by; if undefined, all entities pass
 * @returns whether the entity should be included
 */
export function matchesTag(tags: Tag[], filterTag?: string): boolean {
	return !filterTag || tags.includes(filterTag);
}

// Skills
// ======

/**
 * Flatten a skill into display lines. A formal skill with
 * sub-skills is rendered as "Skill: (SubSkill1, SubSkill2, ..., & SubSkillN)".
 *
 * @param skill the skill to flatten
 * @param bcp47 the BCP 47 locale tag for formatting
 * @returns the list of display lines
 */
export function flattenSkills(skills: Skill[], bcp47: string = "en"): string {
	return new Intl.ListFormat(bcp47, { style: "short", type: "conjunction" }).format(
		skills.map((skill) => {
			if (typeof skill === "string") return skill;
			if (skill.subSkills.length === 0) return skill.name;
			return `${skill.name}: (${flattenSkills(skill.subSkills, bcp47)})`;
		}),
	);
}

// Languages
// =========

/**
 * Get the display name for a language. If the language has a
 * structured name, the endonym is shown with the English name
 * in parentheses.
 *
 * @param name the language name field (string or object)
 * @returns the display name
 */
export function formatLanguageName(name: string | { name: string; englishName?: string }): string {
	if (typeof name === "string") return name;
	return name.englishName ? `${name.name} (${name.englishName})` : name.name;
}

/**
 * Determine the highest proficiency level across all modes
 * (speak, listen, write, read).
 *
 * @param proficiencies an object with speak, listen, write, read proficiency values
 * @returns the label for the highest proficiency level
 */
export function bestProficiency(proficiencies: {
	speak: LanguageProficiency;
	listen: LanguageProficiency;
	write: LanguageProficiency;
	read: LanguageProficiency;
}): string {
	const levels = new Set([
		proficiencies.speak,
		proficiencies.listen,
		proficiencies.write,
		proficiencies.read,
	]);
	const order: LanguageProficiency[] = [
		"native",
		"full_professional",
		"professional_working",
		"limited_working",
		"elementary",
	];
	for (const level of order) {
		if (levels.has(level)) return formatProficiency(level);
	}
	return "";
}
