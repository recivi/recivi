import type { ParsedOptions } from "../options";
import { type CaptureJob, type CaptureJobArgs, generateCapture } from "../utils/capture";

function getOgJob(ogTheme: ParsedOptions["theme"]["og"]): CaptureJob {
	return {
		label: "Open Graph images",
		matches: (pathname) => pathname.includes(".png"),
		preparePage: async (page) => {
			await page.setViewport({
				width: 600, // also hardcoded in `og.css`
				height: 315, // also hardcoded in `og.css`
				deviceScaleFactor: 2,
			});
			await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: ogTheme }]);
		},
		capture: async ({ body, outputPath }) => {
			await body.screenshot({ path: outputPath });
		},
	};
}

/**
 * Generate images by taking screenshots of Open Graph render pages.
 */
export function generateOg(ogTheme: ParsedOptions["theme"]["og"], ...args: CaptureJobArgs) {
	return generateCapture(getOgJob(ogTheme), ...args);
}
