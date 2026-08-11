import { rm } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";

import { preview, type AstroIntegration } from "astro";
import puppeteer, { type Browser, type ElementHandle, type Page } from "puppeteer";

import type { ProjectContext } from "../types/project_context";
import { prefixBase } from "../utils/project_context";

type BuildDoneParams = Parameters<NonNullable<AstroIntegration["hooks"]["astro:build:done"]>>[0];

export type CaptureJobArgs = [
	projectContext: ProjectContext,
	dir: string,
	pages: BuildDoneParams["pages"],
	logger: BuildDoneParams["logger"],
];

interface CaptureContext {
	page: Page;
	body: ElementHandle<HTMLBodyElement>;
	outputPath: string;
}

export interface CaptureJob {
	label: string;
	matches: (pathname: string) => boolean;
	preparePage?: (page: Page) => Promise<void>;
	capture: (context: CaptureContext) => Promise<void>;
}

/**
 * Call the given function with the base URL of an Astro preview server and a
 * Puppeteer browser instance.
 *
 * This function ensures that the Astro preview server and Puppeteer browser are
 * properly torn down after the job.
 *
 * @param callback the function to call with the base URL and Puppeteer browser
 */
async function withPreview(callback: (baseUrl: string, browser: Browser) => Promise<void>) {
	const server = await preview({ logLevel: "error" });
	const baseUrl = `http://${server.host ?? "localhost"}:${server.port}`;
	try {
		const browser = await puppeteer.launch();
		try {
			await callback(baseUrl, browser);
		} finally {
			await browser.close();
		}
	} finally {
		await server.stop();
	}
}

/**
 * Convert one path to a generated asset.
 *
 * This function prepares the page, navigates to the given pathname, waits for
 * the page to load, deletes the raw render page and then captures the page or
 * the body element, writing the output at the same path as the raw render page.
 *
 * @param job the capture job to run
 * @param projectContext the project context
 * @param dir the directory where the build output is located
 * @param logger the logger to use for logging
 * @param baseUrl the base URL of the Astro preview server
 * @param browser the Puppeteer browser instance
 * @param pathname the pathname of the page to capture
 */
async function capturePage(
	job: CaptureJob,
	projectContext: ProjectContext,
	dir: string,
	logger: BuildDoneParams["logger"],
	baseUrl: string,
	browser: Browser,
	pathname: string,
) {
	const page = await browser.newPage();
	try {
		await job.preparePage?.(page);

		const url = `${baseUrl}${prefixBase(projectContext, pathname)}`;
		await page.goto(url, { waitUntil: "networkidle0" });

		const body = await page.waitForSelector("body");
		if (!body) {
			throw new Error(`Could not find <body> at ${url}`);
		}

		// Replace the temporary directory page with the captured file.
		const outputPath = join(dir, pathname.slice(0, -1));
		await rm(outputPath, { recursive: true, force: true });
		await job.capture({ page, body, outputPath });

		logger.info(`  ${styleText("blue", "├─")} ${styleText(["dim", "blue"], url)}`);
		logger.info(`  ${styleText("blue", "│  └─")} ${styleText("dim", outputPath)}`);
	} finally {
		await page.close();
	}
}

/**
 * Invoke the capture job for all pages that match the job's match criteria.
 *
 * @param job the capture job to run
 * @param args the arguments to pass to the capture job
 */
export async function generateCapture(job: CaptureJob, ...args: CaptureJobArgs) {
	const [projectContext, dir, pages, logger] = args;
	const pathnames = pages
		.map(({ pathname }) => pathname)
		.filter((pathname) => job.matches(pathname));

	logger.info(styleText("bgGreen", styleText("black", ` generating ${job.label} `)));

	if (pathnames.length > 0) {
		await withPreview(async (baseUrl, browser) => {
			await Promise.all(
				pathnames.map((pathname) =>
					capturePage(job, projectContext, dir, logger, baseUrl, browser, pathname),
				),
			);
		});
	}

	logger.info(styleText("green", "✓ Completed."));
}
