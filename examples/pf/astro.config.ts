import pf from "@recivi/pf";
import { defineConfig } from "astro/config";

import starlight from "./src/assets/icons/starlight.svg?raw";

export default defineConfig({
	/*
	 * If this setting is not provided, the meta tags for canonical URL and Open
	 * Graph images will not be generated.
	 *
	 * This field should contain the domain only, with no subpath and no trailing
	 * slash.
	 *
	 * More info: https://docs.astro.build/en/reference/configuration-reference/#site
	 */
	// site: "",

	/*
	 * The value of `config.base` as read by integrations will also be determined
	 * by your `trailingSlash` configuration.
	 *
	 * This field should contain a subpath, with a leading slash and no trailing
	 * slash.
	 *
	 * More info: https://docs.astro.build/en/reference/configuration-reference/#base
	 */
	// base: "/",

	/*
	 * This setting only affects the dev server. The prod behavior (including
	 * possible redirects) is determined by the hosting provider, based on its own
	 * rules for directories, files and extensions.
	 *
	 * It is not advisable to change this field from the default "ignore".
	 *
	 * More info: https://docs.astro.build/en/reference/configuration-reference/#trailingslash
	 */
	// trailingSlash: "ignore",

	build: {
		/*
		 * The directory build format does not have the `.html` extension so it's
		 * both easier to read and write.
		 *
		 * It is not advisable to change this field from the default "directory".
		 *
		 * More info: https://docs.astro.build/en/reference/configuration-reference/#buildformat
		 */
		// format: "directory",
	},

	devToolbar: { enabled: false },
	integrations: [
		// Récivi PF integration
		pf({
			/*
			 * If you would like to use different Récivi data files for development
			 * and production, you can use `import.meta.env.DEV` to conditionally
			 * specify them here.
			 */
			reciviDataFile: "",
			icons: {
				packs: {
					// See an example of custom icons usage on the "Colophon" page.
					custom: {
						starlight,
					},
				},
				aliases: {
					// Some brands have Lucide icons, which we don't like.
					github: { pack: "simple-icons", name: "github" },
					linkedin: { pack: "simple-icons", name: "linkedin" },
					instagram: { pack: "simple-icons", name: "instagram" },
				},
			},
		}),
	],
});
