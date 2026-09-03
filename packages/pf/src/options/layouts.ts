import { z } from "astro/zod";

import { layoutNames, type LayoutName } from "../layouts/index";
import { primaryRegistry } from "../registries/primary";

export const layoutsSchema = z
	.object(
		Object.fromEntries(
			layoutNames.map((name) => [
				name,
				z.string().optional().default(`@recivi/pf/layouts/defs/${name}.astro`),
			]),
		) as Record<LayoutName, z.ZodDefault<z.ZodOptional<z.ZodString>>>,
	)
	.register(primaryRegistry, {
		id: "Layouts",
		description: "the custom layout overrides for the site",
	});
