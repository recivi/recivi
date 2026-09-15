import { type CaptureJob, type CaptureJobArgs, generateCapture } from "../utils/capture";

const pdfJob: CaptureJob = {
	label: "résumé PDFs",
	matches: (pathname) => pathname.includes(".pdf"),
	wait: async (page) => {
		// Bounded explicitly: a `.pdf` page built on a custom layout never sets
		// the flag, and Puppeteer's default would spend 30s per page to find out.
		await page.waitForFunction(() => window.pfPrintPreviewSettled === true, {
			timeout: 15_000,
		});
	},
	capture: async ({ page, outputPath }) => {
		await page.pdf({
			path: outputPath,
			preferCSSPageSize: true,
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
