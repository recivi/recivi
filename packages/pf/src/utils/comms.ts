import { type Phone, type Profile } from "@recivi/schema";
import projectContext from "virtual:pf/project-context";

import type { AnchorProps } from "../components/props/Anchor";
import type { BrandProps } from "../components/props/Brand";

export type Comm = BrandProps & {
	/**
	 * the title of the communication channel; It is the same as the `title` field
	 * of the icon, if the icon is not undefined.
	 */
	title: string;
	// Make the `anchor` field required and not `undefined`.
	anchor: AnchorProps;
};

/**
 * Get a `Comm` instance for a given email address.
 *
 * @param email the email address to wrap in a `Comm` instance
 * @returns the `Comm` instance for the given email address
 */
export function emailToComm(email: string): Comm {
	return {
		title: "Email",
		icon: { pack: "lucide", name: "mail", title: "Email" },
		anchor: { url: { dest: `mailto:${email}`, label: email }, rel: "me" },
		name: email,
	};
}

/**
 * Get a `Comm` instance for a given phone number.
 *
 * @param phone the phone number to wrap in a `Comm` instance
 * @returns the `Comm` instance for the given phone number
 */
export function phoneToComm(phone: Phone): Comm {
	const { countryCode: cc, number } = phone;
	const formattedNumber = `+${cc} ${number}`;
	const normalizedNumber = formattedNumber.replaceAll(/[\s()-]/gu, "");
	return {
		title: "Phone",
		icon: { pack: "lucide", name: "phone", title: "Phone" },
		anchor: { url: { dest: `tel:${normalizedNumber}`, label: formattedNumber }, rel: "me" },
		name: formattedNumber,
	};
}

/**
 * Get a `Comm` instance for a given social profile.
 *
 * @param profile the social profile to wrap in a `Comm` instance
 * @returns the `Comm` instance for the given social profile
 */
export function profileToComm(profile: Profile): Comm {
	const icon = profile.site.id ? { name: profile.site.id, title: profile.site.name } : undefined;
	const anchor = {
		url: {
			dest: typeof profile.url === "string" ? profile.url : profile.url.dest,
			label: profile.username ?? profile.site.name,
		},
		rel: "me",
	};
	return {
		title: profile.site.name,
		icon,
		anchor,
		name: profile.username ?? profile.site.name,
	};
}

/**
 * Get a `Comm` instance for this website.
 *
 * If the project context does not set the `site` and `base` fields necessary to
 * determine the website URL, this function will return `undefined`.
 *
 * @returns the `Comm` instance if the website can be determined, `undefined` otherwise
 */
export function webToComm(): Comm | undefined {
	const { site, base } = projectContext;
	if (!site) {
		return undefined;
	}

	const href = base === "/" ? site : new URL(base, site).href;
	return {
		title: "Website",
		icon: { pack: "lucide", name: "globe", title: "Website" },
		anchor: {
			url: { dest: href, label: href },
			rel: "me",
		},
		name: href,
	};
}
