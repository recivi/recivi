/**
 * This module provides many utility functions for working with Récivi schema
 * types.
 */

import type { Url, Date, Institute, Org, Epic } from "@/index";

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
