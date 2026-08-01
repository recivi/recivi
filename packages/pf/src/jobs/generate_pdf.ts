import { type CaptureJob, type CaptureJobArgs, generateCapture } from "../utils/capture";

const pdfJob: CaptureJob = {
	label: "résumé PDFs",
	matches: (pathname) => pathname.includes(".pdf"),
	capture: async ({ page, outputPath }) => {
		await page.pdf({
			path: outputPath,
			format: "A4",
			printBackground: true,
		});
	},
};

/**
 * Generate PDF by "printing" the résumé render pages.
 */
export function generatePdf(...args: CaptureJobArgs) {
	return generateCapture(pdfJob, ...args);
}
