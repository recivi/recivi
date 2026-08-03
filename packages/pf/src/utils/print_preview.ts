const contentSelector = "[data-pf-print-content]";
const offsetAttribute = "data-pf-print-page-break-offset";
const offsetProperty = "--pf-print-page-break-offset";
const pageCountProperty = "--pf-print-page-count";

const maxPositionCorrections = 3;
const positionEpsilon = 0.01;

export interface PrintPreviewPaginationOptions {
	/** Root element representing the print sheet. Defaults to `document.body`. */
	root?: HTMLElement;
	/** Element whose block-end determines the number of preview pages. */
	content?: HTMLElement;
}

export interface PrintPreviewPaginationResult {
	pageCount: number;
	shiftedElementCount: number;
}

interface PageGeometry {
	pageBlockSize: number;
	pageMarginStart: number;
	pageMarginEnd: number;
	printableBlockSize: number;
	previewScale: number;
	rootBlockStart: number;
}

interface BlockGeometry {
	start: number;
	size: number;
	end: number;
}

/**
 * Check whether a measurement is finite and greater than zero.
 *
 * @param value the measurement to validate
 * @returns whether the measurement can safely be used for pagination
 */
function isPositiveFinite(value: number): boolean {
	return Number.isFinite(value) && value > 0;
}

/**
 * Convert a computed CSS length such as `"56.6929px"` to its numeric value.
 *
 * @param value a resolved CSS length
 * @returns the length in CSS pixels, or `NaN` when it cannot be parsed
 */
function parseCssLength(value: string): number {
	// Computed CSS lengths include units, which Number() does not accept.
	// oxlint-disable-next-line unicorn/prefer-number-coercion
	return Number.parseFloat(value);
}

/**
 * Collect and validate the measurements shared by all pagination operations.
 * Page and margin sizes use untransformed CSS pixels, while `rootBlockStart`
 * records the rendered viewport position used to normalize element rectangles.
 * A temporary child resolves `--pf-print-block-size` in the root's style context
 * and measures the effective preview scale without relying on a rounded
 * serialized transform matrix.
 *
 * @param root the element representing the complete print preview
 * @returns the normalized page geometry, or `undefined` if it cannot be measured
 */
function measurePageGeometry(root: HTMLElement): PageGeometry | undefined {
	const view = root.ownerDocument.defaultView;
	if (!view) return;

	const rootStyle = view.getComputedStyle(root);
	const rootBlockStart = root.getBoundingClientRect().top;
	const ruler = root.ownerDocument.createElement("div");
	ruler.style.position = "absolute";
	ruler.style.visibility = "hidden";
	ruler.style.pointerEvents = "none";
	ruler.style.blockSize = "var(--pf-print-block-size)";
	root.append(ruler);

	try {
		const pageBlockSize = parseCssLength(view.getComputedStyle(ruler).blockSize);
		const pageMarginStart = parseCssLength(rootStyle.paddingBlockStart);
		const pageMarginEnd = parseCssLength(rootStyle.paddingBlockEnd);
		const printableBlockSize = pageBlockSize - pageMarginStart - pageMarginEnd;
		const previewScale = ruler.getBoundingClientRect().height / pageBlockSize;

		if (
			![pageBlockSize, pageMarginStart, pageMarginEnd].every((value) => Number.isFinite(value)) ||
			!isPositiveFinite(printableBlockSize) ||
			!isPositiveFinite(previewScale)
		) {
			return;
		}

		return {
			pageBlockSize,
			pageMarginStart,
			pageMarginEnd,
			printableBlockSize,
			previewScale,
			rootBlockStart,
		};
	} finally {
		ruler.remove();
	}
}

/**
 * Convert an element's transformed viewport rectangle into block-axis
 * coordinates relative to the preview root.
 *
 * @param element the element to measure
 * @param geometry the page geometry used to remove root offset and preview scale
 * @returns the element's start, size and end in untransformed CSS pixels
 */
function measureBlockGeometry(element: HTMLElement, geometry: PageGeometry): BlockGeometry {
	const rect = element.getBoundingClientRect();
	const start = (rect.top - geometry.rootBlockStart) / geometry.previewScale;
	const size = rect.height / geometry.previewScale;

	return { start, size, end: start + size };
}

/**
 * Remove page-count and element-offset styles left by an earlier pagination
 * pass so that every run starts from the document's natural layout.
 *
 * @param root the print-preview root to reset
 */
function resetPagination(root: HTMLElement): void {
	root.style.removeProperty(pageCountProperty);
	root.querySelectorAll<HTMLElement>(`[${offsetAttribute}]`).forEach((element) => {
		element.removeAttribute(offsetAttribute);
		element.style.removeProperty(offsetProperty);
	});
}

/**
 * Find descendants whose computed `break-inside` value requests that the
 * browser keep the complete element on one page.
 *
 * @param root the subtree to search
 * @returns avoided elements in document order
 */
function getAvoidedElements(root: HTMLElement): HTMLElement[] {
	const view = root.ownerDocument.defaultView;
	if (!view) return [];

	return Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
		(element) => view.getComputedStyle(element).breakInside === "avoid-page",
	);
}

/**
 * Decide whether an avoided block must move to a printable page start. Blocks
 * already fitting in the printable area stay in place; blocks in a margin or
 * crossing the page bottom move forward. A block taller than the printable
 * area is left alone because it cannot fit intact on any page.
 *
 * @param block the avoided block's normalized geometry
 * @param geometry the print page and margin measurements
 * @returns the target block-start, or `undefined` when no move is possible or needed
 */
function getNextPageStart(block: BlockGeometry, geometry: PageGeometry): number | undefined {
	if (block.size > geometry.printableBlockSize) return;

	const pageIndex = Math.max(0, Math.floor(block.start / geometry.pageBlockSize));
	const pageStart = pageIndex * geometry.pageBlockSize + geometry.pageMarginStart;
	const pageBottom = (pageIndex + 1) * geometry.pageBlockSize - geometry.pageMarginEnd;

	if (block.start < pageStart) return pageStart;
	if (block.end <= pageBottom) return;

	return (pageIndex + 1) * geometry.pageBlockSize + geometry.pageMarginStart;
}

/**
 * Move an element to a target block position by overriding its block-start
 * margin. The correction loop remeasures after each write to compensate for
 * margin collapsing and browser subpixel rounding.
 *
 * @param element the avoided element to shift
 * @param targetBlockStart the desired root-relative start in CSS pixels
 * @param geometry the page geometry used when remeasuring the element
 */
function moveElementTo(
	element: HTMLElement,
	targetBlockStart: number,
	geometry: PageGeometry,
): void {
	const view = element.ownerDocument.defaultView;
	if (!view) return;

	const currentBlockStart = measureBlockGeometry(element, geometry).start;
	const currentMarginStart = parseCssLength(view.getComputedStyle(element).marginBlockStart) || 0;
	let marginStart = currentMarginStart + targetBlockStart - currentBlockStart;

	element.style.setProperty(offsetProperty, `${marginStart}px`);
	element.setAttribute(offsetAttribute, "");

	for (let attempt = 0; attempt < maxPositionCorrections; attempt += 1) {
		const shiftedBlockStart = measureBlockGeometry(element, geometry).start;
		const remainingOffset = targetBlockStart - shiftedBlockStart;

		if (Math.abs(remainingOffset) <= positionEpsilon) return;

		marginStart += remainingOffset;
		element.style.setProperty(offsetProperty, `${marginStart}px`);
	}
}

/**
 * Calculate how many full preview sheets are needed after all avoided elements
 * have been shifted. Including the final page's end margin ensures the page
 * count covers the same area as the visual sheet background.
 *
 * @param content the element whose block-end marks the end of preview content
 * @param geometry the normalized print page measurements
 * @returns at least one page
 */
function calculatePageCount(content: HTMLElement, geometry: PageGeometry): number {
	const contentBlockEnd = measureBlockGeometry(content, geometry).end;
	const occupiedBlockSize = contentBlockEnd + geometry.pageMarginEnd;

	return Math.max(1, Math.ceil((occupiedBlockSize - positionEpsilon) / geometry.pageBlockSize));
}

/**
 * Make the screen print preview respect `break-inside: avoid-page` and expose
 * its final page count as `--pf-print-page-count` on the root element.
 *
 * Pagination runs once after the document's fonts are ready. Print media is
 * unaffected because both this function and its companion styles are scoped
 * to screen media.
 *
 * @param options optional root and content overrides, primarily for custom layouts
 * @returns pagination statistics, or `undefined` when pagination is not applicable
 */
export async function paginatePrintPreview(
	options: PrintPreviewPaginationOptions = {},
): Promise<PrintPreviewPaginationResult | undefined> {
	const document =
		options.root?.ownerDocument ?? options.content?.ownerDocument ?? globalThis.document;
	const view = document?.defaultView;

	if (!document || !view?.matchMedia("screen").matches) return;

	await document.fonts.ready;

	const root = options.root ?? document.body;
	const content = options.content ?? root.querySelector<HTMLElement>(contentSelector);
	if (!content) return;

	resetPagination(root);

	const geometry = measurePageGeometry(root);
	if (!geometry) return;

	let shiftedElementCount = 0;

	for (const element of getAvoidedElements(root)) {
		const nextPageStart = getNextPageStart(measureBlockGeometry(element, geometry), geometry);
		if (nextPageStart === undefined) continue;

		moveElementTo(element, nextPageStart, geometry);
		shiftedElementCount += 1;
	}

	const pageCount = calculatePageCount(content, geometry);
	root.style.setProperty(pageCountProperty, String(pageCount));

	return { pageCount, shiftedElementCount };
}
