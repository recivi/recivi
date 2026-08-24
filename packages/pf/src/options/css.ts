import { z } from "astro/zod";

import { layoutNames, type LayoutName } from "../layouts";
import { primaryRegistry } from "../registries/primary";

const layerNames = [
	"props",
	"reset",
	"core",
	"media",
	"universal",
	"components",
	"overrides",
	"utils",
] as const;

const defaultLayers = layerNames.flatMap((layer) => [`pf-${layer}`, layer]);

// `z.object` ensures that every layout named above has an entry. We are not
// using `z.record` because we want to allow missing keys in the input.
const customCssSchema = z.object(
	Object.fromEntries(
		layoutNames.map((name) => [name, z.array(z.string()).optional().default([])]),
	) as Record<LayoutName, z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>,
);

export const cssSchema = z
	.object({
		/**
		 * the paths to extra CSS files to include in the site; The files must be
		 * located in `src/` and paths should be relative to the config file.
		 */
		customCss: customCssSchema.optional().prefault({}).register(primaryRegistry, {
			description:
				"the paths to extra CSS files to include in the site; The files must be located in `src/` and paths should be relative to the config file.",
		}),
		/** additional CSS layers to append after the default layer order */
		addedLayers: z.array(z.string()).optional().register(primaryRegistry, {
			description: "additional CSS layers to append after the default layer order",
		}),
	})
	.register(primaryRegistry, {
		id: "Css",
		description: "the site's CSS customizations",
	})
	.transform((val) => ({
		customCss: val.customCss,
		layers: [...defaultLayers, ...(val.addedLayers ?? [])],
	}));
