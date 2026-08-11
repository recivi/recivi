import { basename } from "node:path";
import { fileURLToPath } from "node:url";

import { satteri, type SatteriAstroData } from "@astrojs/markdown-satteri";
import { defineMdastPlugin, type MdastNode, type MdastVisitorContext } from "satteri";

function applyDefaultLayout(node: Readonly<MdastNode>, ctx: MdastVisitorContext) {
	if (ctx.parent(node)?.type !== "root" || !ctx.fileURL) {
		return;
	}

	const astroData = ctx.data.astro as SatteriAstroData | undefined;
	if (
		ctx.fileURL.pathname.includes("/pages/") &&
		!basename(fileURLToPath(ctx.fileURL)).startsWith("_") &&
		astroData?.frontmatter &&
		!astroData.frontmatter.layout
	) {
		astroData.frontmatter.layout = "@recivi/pf/layouts/defs/Web.astro";
	}
}

/**
 * Set the default layout for pages to be `<Web>`. This is only set if all of
 * the following conditions are met:
 *
 * - The file path is in the `/pages/` directory.
 * - The page is not hidden, i.e. its name does not start with an underscore.
 * - The page contains some frontmatter.
 * - The frontmatter does not have a layout specified.
 */
const defaultLayout = defineMdastPlugin({
	name: "default-layout",
	// TODO Use a root visitor after bruits/satteri#164
	paragraph: applyDefaultLayout,
	heading: applyDefaultLayout,
	thematicBreak: applyDefaultLayout,
	blockquote: applyDefaultLayout,
	list: applyDefaultLayout,
	html: applyDefaultLayout,
	code: applyDefaultLayout,
	definition: applyDefaultLayout,
	footnoteDefinition: applyDefaultLayout,
	table: applyDefaultLayout,
	yaml: applyDefaultLayout,
	toml: applyDefaultLayout,
	math: applyDefaultLayout,
	containerDirective: applyDefaultLayout,
	leafDirective: applyDefaultLayout,
	mdxJsxFlowElement: applyDefaultLayout,
	mdxFlowExpression: applyDefaultLayout,
	mdxjsEsm: applyDefaultLayout,
});

export const satteriProcessor = satteri({
	mdastPlugins: [defaultLayout],
});
