import { icons as iconsLucide } from "@iconify-json/lucide";
import { icons as iconsSi } from "@iconify-json/simple-icons";
import { z } from "astro/zod";

import reciviSvg from "../assets/icons/recivi.svg?raw";
import { primaryRegistry } from "../registries/primary";
import { stripSvgTag } from "../utils/markup";

const defaultPacks = {
	lucide: iconsLucide.icons,
	"simple-icons": iconsSi.icons,
	pf: { recivi: { body: stripSvgTag(reciviSvg) } },
};

export const iconsSchema = z
	.object({
		/**
		 * whether to show icons on the site; Setting this to `false`
		 * converts the `Icon` component into a no-op.
		 */
		isEnabled: z.boolean().optional().default(true).register(primaryRegistry, {
			description:
				"whether to show icons on the site; Setting this to `false` converts the `Icon` component into a no-op.",
		}),
		/**
		 * a record of custom icon packs to use; You can use Iconify icons
		 * as the value of this record.
		 */
		packs: z
			.record(
				/** the name of the icon pack */
				z.string(),
				z.record(
					/** the name of the icon */
					z.string(),
					/** the contents of the icon */
					z.union([
						z.object({
							/** the SVG body of the icon */
							body: z.string().register(primaryRegistry, {
								description: "the SVG body of the icon",
							}),
						}),
						z.string().transform((val) => {
							return { body: stripSvgTag(val) };
						}),
					]),
				),
			)
			.optional()
			.default({})
			.transform((val): typeof val => {
				return {
					...defaultPacks,
					...val,
				};
			})
			.register(primaryRegistry, {
				description:
					"a record of custom icon packs to use; You can use Iconify icons as the value of this record.",
			}),
		/** a record of icon aliases to use */
		aliases: z
			.record(
				/** the alias name for the icon */
				z.string(),
				/** the reference for the actual icon to show */
				z.object({
					/** the name the icon pack */
					pack: z.string().optional().register(primaryRegistry, {
						description: "the name of the icon pack",
					}),
					/** the name of the icon */
					name: z.string().register(primaryRegistry, {
						description: "the name of the icon",
					}),
				}),
			)
			.optional()
			.default({})
			.register(primaryRegistry, {
				description: "a record of icon aliases to use",
			}),
	})
	.register(primaryRegistry, {
		id: "Icons",
		description: "configuration to use icons in the site",
	});
