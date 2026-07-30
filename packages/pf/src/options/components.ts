import { z } from "astro/zod";

import { componentNames, type ComponentName } from "../components/index";
import { primaryRegistry } from "../registries/primary";

export const componentsSchema = z
	.object(
		Object.fromEntries(
			componentNames.map((name) => [
				name,
				z.string().optional().default(`@recivi/pf/components/defs/${name}.astro`),
			]),
		) as Record<ComponentName, z.ZodDefault<z.ZodOptional<z.ZodString>>>,
	)
	.register(primaryRegistry, {
		id: "components",
		description: "the custom component overrides for the site",
	});
