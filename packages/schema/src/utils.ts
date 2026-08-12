/**
 * This module provides many utility functions for working with Récivi schema
 * types.
 */

import type { Url, Date, Institute, Org, Epic, LanguageProficiency, Language } from "@/index";

// Entities
// ========

/**
 * Determine if the given entity matches interface `Institute`.
 *
 * @param entity the entity to check
 * @returns `true` if the entity matches `Institute`, `false` otherwise
 */
export function isInstitute(entity: Institute | Org | Epic): entity is Institute {
	return "certs" in entity;
}

/**
 * Determine if the given entity matches interface `Org`.
 *
 * @param entity the entity to check
 * @returns `true` if the entity matches `Org`, `false` otherwise
 */
export function isOrg(entity: Institute | Org | Epic): entity is Org {
	return "roles" in entity;
}

/**
 * Determine if the given entity matches interface `Epic`.
 *
 * @param entity the entity to check
 * @returns `true` if the entity matches `Epic`, `false` otherwise
 */
export function isEpic(entity: Institute | Org | Epic): entity is Epic {
	return "projects" in entity;
}

// Dates
// =====

/**
 * Convert a JS `Date` instance to Récivi's date format. This returns
 * the tuple form of the date, as JS dates always include all the
 * necessary components.
 *
 * @param date the `Date` instance to convert
 * @returns the Récivi representation of the given date
 */
export function jsDateToRcvDate(date: globalThis.Date): [number, number, number] {
	return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
}

/**
 * Get the year, month, and day from a Récivi date, which can
 * be a tuple or an object.
 *
 * @param date the Récivi date to decompose
 * @returns the year, month, and day as a tuple
 */
export function dateParts(date: Date): [number, number | undefined, number | undefined] {
	if (Array.isArray(date))
		return date.length === 3
			? date
			: date.length === 2
				? [date[0], date[1], undefined]
				: [date[0], undefined, undefined];
	return [date.year, date.month, date.day];
}

// URLs
// ====

/**
 * Extract the destination URL string from a Récivi `Url`, which
 * can be a plain string or a labelled object.
 *
 * @param url the Récivi Url to extract from
 * @returns the URL string
 */
export function urlDest(url: Url): string {
	return typeof url === "string" ? url : url.dest;
}

/**
 * Extract the label from a Récivi `Url`, falling back to the
 * destination if no label is provided.
 *
 * @param url the Récivi `Url` to extract from
 * @returns the label or destination string
 */
export function urlLabel(url: Url): string {
	return typeof url === "string" ? url : url.label;
}

// Language
// ========

/**
 * Get the numerical score of a language proficiency level.
 *
 * @param proficiency convert the proficiency level to a numerical value
 * @returns the numerical score of a proficiency level
 */
export function getProficiencyScore(proficiency: LanguageProficiency): number {
	switch (proficiency) {
		case "no":
			return 0;
		case "elementary":
			return 1;
		case "limited_working":
			return 2;
		case "professional_working":
			return 3;
		case "full_professional":
			return 4;
		case "native":
		case "not_possible":
			return 5;
		default:
			throw new Error(`Invalid proficiency level: ${proficiency}`);
	}
}

/**
 * Get the language proficiency level corresponding to a numerical score.
 *
 * @param score the numerical score to convert to a proficiency level
 * @returns the language proficiency level corresponding to the score
 */
export function getScoreProficiency(score: number): LanguageProficiency {
	if (score < 1) return "no";
	if (score < 2) return "elementary";
	if (score < 3) return "limited_working";
	if (score < 4) return "professional_working";
	if (score < 5) return "full_professional";
	if (score === 5) return "native";
	throw new Error(`Invalid score: ${score}`);
}

/**
 * Get the overall proficiency of a language based on the proficiency levels of
 * all its modes (speak, listen, write, read).
 *
 * @param language the language for which to calculate the proficiency
 * @returns the overall proficiency of all modes
 */
export function getOverallProficiency(language: Language): LanguageProficiency | undefined {
	const speakScore = getProficiencyScore(language.speak);
	const scores = [
		speakScore,
		getProficiencyScore(language.listen),
		getProficiencyScore(language.write),
		getProficiencyScore(language.read),
	];

	// If there is too much spread in proficiency levels, we cannot determine an
	// overall score.
	if (Math.max(...scores) - Math.min(...scores) >= 2) {
		return undefined;
	}
	let overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
	// The overall score cannot be more than one level above that of speaking.
	overallScore = Math.min(overallScore, speakScore + 1);

	return getScoreProficiency(overallScore);
}
