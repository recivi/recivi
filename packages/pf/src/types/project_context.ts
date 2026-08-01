import type { AstroConfig } from "astro";

// Make sure that the `ProjectContext` interface only includes types that can
// survive JSON serialization, since it will be serialized into a virtual
// module. For example, interface `AstroConfig` has a `publicDir` field but we
// don't extend that because it is a `URL` going in, but a `string` coming out.

export interface ProjectContext extends Pick<AstroConfig, "site" | "base" | "trailingSlash"> {
	/** the path to the project's public directory */
	publicDir: string;
	/** whether the site has any of the icons that require `manifest.webmanifest` */
	hasManifestIcons: boolean;
}
