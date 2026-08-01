import { type CaptureJob, type CaptureJobArgs, generateCapture } from "../utils/capture";

const ogJob: CaptureJob = {
	label: "Open Graph images",
	matches: (pathname) => pathname.includes(".png"),
	preparePage: async (page) => {
		await page.setViewport({ width: 600, height: 315, deviceScaleFactor: 2 });
	},
	capture: async ({ body, outputPath }) => {
		await body.screenshot({ path: outputPath });
	},
};

/**
 * Generate images by taking screenshots of Open Graph render pages.
 */
export function generateOg(...args: CaptureJobArgs) {
	return generateCapture(ogJob, ...args);
}
