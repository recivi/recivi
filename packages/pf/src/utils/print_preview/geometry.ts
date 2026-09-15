import type { BlockGeometry, PageGeometry } from "./types";

/**
 * Snap a measurement to the device pixel grid.
 *
 * Blink resolves `line-height: normal` onto the device pixel grid, so raw
 * fractional rectangles overcount by a fraction per line. Over a full page that
 * accumulates into phantom overflow, which the previous implementation chased
 * with a retry loop after the fact instead of preventing here.
 */
export function roundToDevicePixels(value: number, devicePixelRatio: number): number {
	if (!Number.isFinite(value)) return value;
	if (devicePixelRatio <= 1) return Math.floor(value);

	return Math.round(value * devicePixelRatio) / devicePixelRatio;
}

/** Parse a computed length such as `"56.6929px"`; `Number()` rejects the unit. */
export function parseCssLength(value: string): number {
	// oxlint-disable-next-line unicorn/prefer-number-coercion
	return Number.parseFloat(value);
}

function isPositiveFinite(value: number): boolean {
	return Number.isFinite(value) && value > 0;
}

/**
 * Measure the print sheet once.
 *
 * A temporary child resolves `--pf-print-block-size` in the root's own style
 * context and yields the effective preview scale, which is more reliable than
 * reading the rounded serialized transform matrix.
 *
 * @param root the element representing the complete print preview
 * @returns the page geometry, or `undefined` when it cannot be measured
 */
export function measurePageGeometry(root: HTMLElement): PageGeometry | undefined {
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
			devicePixelRatio: isPositiveFinite(view.devicePixelRatio) ? view.devicePixelRatio : 1,
		};
	} finally {
		ruler.remove();
	}
}

/**
 * Convert a rendered rectangle into untransformed block-axis coordinates,
 * without snapping. Use this only where exactness matters more than stability,
 * such as computing the shift that moves an element to a page boundary.
 */
export function measureExactBlockGeometry(
	element: HTMLElement,
	geometry: PageGeometry,
): BlockGeometry {
	const rect = element.getBoundingClientRect();
	const start = (rect.top - geometry.rootBlockStart) / geometry.previewScale;
	const size = rect.height / geometry.previewScale;

	return { start, size, end: start + size };
}

/** Convert a rendered rectangle into snapped untransformed block-axis coordinates. */
export function measureBlockGeometry(element: HTMLElement, geometry: PageGeometry): BlockGeometry {
	const exact = measureExactBlockGeometry(element, geometry);
	const start = roundToDevicePixels(exact.start, geometry.devicePixelRatio);
	const size = roundToDevicePixels(exact.size, geometry.devicePixelRatio);

	return { start, size, end: start + size };
}
