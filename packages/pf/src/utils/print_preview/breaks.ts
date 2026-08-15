const maxPaginationPasses = 100;
const positionEpsilon = 0.01;

const avoidedBreakValues = new Set(["avoid", "avoid-page"]);
const blockDisplayValues = new Set([
	"block",
	"flex",
	"flow-root",
	"grid",
	"list-item",
	"table",
	"table-footer-group",
	"table-header-group",
	"table-row",
	"table-row-group",
]);
const blockFlowContainerDisplayValues = new Set([
	"block",
	"flow-root",
	"list-item",
	"table-caption",
	"table-cell",
]);
const forcedPageBreakValues = new Set(["page", "left", "right", "recto", "verso"]);

export interface PageGeometry {
	pageBlockSize: number;
	pageMarginStart: number;
	pageMarginEnd: number;
	printableBlockSize: number;
	previewScale: number;
	rootBlockStart: number;
}

export interface BlockGeometry {
	start: number;
	size: number;
	end: number;
}

interface BreakOpportunity {
	after: HTMLElement;
	avoidedAncestors: HTMLElement[];
	isAvoided: boolean;
	isForced: boolean;
}

interface PageBounds {
	pageStart: number;
	pageBottom: number;
	nextPageStart: number;
}

interface PageBreakSelection {
	isComplete: boolean;
	opportunity: BreakOpportunity | undefined;
}

type MeasureBlockGeometry = (element: HTMLElement, geometry: PageGeometry) => BlockGeometry;
type MoveElementTo = (
	element: HTMLElement,
	targetBlockStart: number,
	geometry: PageGeometry,
) => void;

/**
 * Find descendants whose computed `break-inside` value requests that the
 * browser keep the complete element on one page.
 *
 * @param root the subtree to search
 * @returns avoided elements in document order
 */
export function getAvoidedElements(root: HTMLElement): HTMLElement[] {
	const view = root.ownerDocument.defaultView;
	if (!view) return [];

	return Array.from(root.querySelectorAll<HTMLElement>("*")).filter((element) =>
		avoidedBreakValues.has(view.getComputedStyle(element).breakInside),
	);
}

/**
 * Decide whether an avoided block must move to a printable page start.
 *
 * @param block the avoided block's normalized geometry
 * @param geometry the print page and margin measurements
 * @returns the target block-start, or `undefined` when no move is possible or needed
 */
export function getNextPageStart(block: BlockGeometry, geometry: PageGeometry): number | undefined {
	if (block.size > geometry.printableBlockSize) return;

	const pageIndex = Math.max(0, Math.floor(block.start / geometry.pageBlockSize));
	const pageStart = pageIndex * geometry.pageBlockSize + geometry.pageMarginStart;
	const pageBottom = (pageIndex + 1) * geometry.pageBlockSize - geometry.pageMarginEnd;

	if (block.start < pageStart) return pageStart;
	if (block.end <= pageBottom) return;

	return (pageIndex + 1) * geometry.pageBlockSize + geometry.pageMarginStart;
}

function getRenderedChildren(parent: HTMLElement): HTMLElement[] {
	const view = parent.ownerDocument.defaultView;
	if (!view) return [];

	return Array.from(parent.children).flatMap((child) => {
		const element = child as HTMLElement;
		const style = view.getComputedStyle(element);
		if (style.display === "none" || style.position === "absolute" || style.position === "fixed") {
			return [];
		}
		if (style.display === "contents") return getRenderedChildren(element);
		if (!blockDisplayValues.has(style.display)) return [];

		const rect = element.getBoundingClientRect();
		return rect.width > positionEpsilon || rect.height > positionEpsilon ? [element] : [];
	});
}

function getCommonAncestor(first: HTMLElement, second: HTMLElement): HTMLElement | null {
	const firstAncestors = new Set<HTMLElement>();
	for (let ancestor = first.parentElement; ancestor; ancestor = ancestor.parentElement) {
		firstAncestors.add(ancestor);
	}
	for (let ancestor = second.parentElement; ancestor; ancestor = ancestor.parentElement) {
		if (firstAncestors.has(ancestor)) return ancestor;
	}
	return null;
}

function getAvoidedBreakAncestors(
	before: HTMLElement,
	after: HTMLElement,
	root: HTMLElement,
): HTMLElement[] {
	const view = root.ownerDocument.defaultView;
	if (!view) return [];

	const avoidedAncestors: HTMLElement[] = [];

	for (
		let ancestor = getCommonAncestor(before, after);
		ancestor && ancestor !== root;
		ancestor = ancestor.parentElement
	) {
		if (avoidedBreakValues.has(view.getComputedStyle(ancestor).breakInside)) {
			avoidedAncestors.push(ancestor);
		}
	}
	return avoidedAncestors;
}

function getBreakOpportunities(root: HTMLElement): BreakOpportunity[] {
	const view = root.ownerDocument.defaultView;
	if (!view) return [];

	const opportunities: BreakOpportunity[] = [];
	const visit = (parent: HTMLElement): void => {
		const children = getRenderedChildren(parent);
		if (blockFlowContainerDisplayValues.has(view.getComputedStyle(parent).display)) {
			for (let index = 1; index < children.length; index += 1) {
				const before = children[index - 1];
				const after = children[index];
				if (!before || !after) continue;

				const breakAfter = view.getComputedStyle(before).breakAfter;
				const breakBefore = view.getComputedStyle(after).breakBefore;
				const isForced =
					forcedPageBreakValues.has(breakAfter) || forcedPageBreakValues.has(breakBefore);
				const avoidedAncestors = getAvoidedBreakAncestors(before, after, root);
				const isAvoided =
					!isForced &&
					(avoidedBreakValues.has(breakAfter) ||
						avoidedBreakValues.has(breakBefore) ||
						avoidedAncestors.length > 0);

				opportunities.push({ after, avoidedAncestors, isAvoided, isForced });
			}
		}

		children.forEach((child) => visit(child));
	};

	visit(root);
	return opportunities;
}

/**
 * Check whether an avoided boundary may be used because every ancestor that
 * protects it is itself taller than a printable page. Explicit sibling
 * avoidance remains protected; a different boundary inside either sibling
 * can still be selected when that content is oversized.
 */
function isUsableOpportunity(
	opportunity: BreakOpportunity,
	geometry: PageGeometry,
	measureBlockGeometry: MeasureBlockGeometry,
): boolean {
	if (opportunity.isForced || !opportunity.isAvoided) return true;
	if (opportunity.avoidedAncestors.length === 0) return false;

	return opportunity.avoidedAncestors.every(
		(ancestor) =>
			measureBlockGeometry(ancestor, geometry).size > geometry.printableBlockSize + positionEpsilon,
	);
}

/** Select the legal boundary that should end the current preview page. */
function selectPageBreak(
	opportunities: BreakOpportunity[],
	contentEnd: number,
	bounds: PageBounds,
	geometry: PageGeometry,
	measureBlockGeometry: MeasureBlockGeometry,
): PageBreakSelection {
	const getStart = (opportunity: BreakOpportunity): number =>
		measureBlockGeometry(opportunity.after, geometry).start;
	const forcedOpportunity = opportunities.find(
		(opportunity) =>
			opportunity.isForced &&
			getStart(opportunity) > bounds.pageStart + positionEpsilon &&
			getStart(opportunity) < bounds.nextPageStart - positionEpsilon,
	);
	if (contentEnd <= bounds.pageBottom + positionEpsilon && !forcedOpportunity) {
		return { isComplete: true, opportunity: undefined };
	}

	const usableOpportunities = opportunities.filter((opportunity) =>
		isUsableOpportunity(opportunity, geometry, measureBlockGeometry),
	);
	const marginOpportunity = usableOpportunities.find(
		(opportunity) =>
			getStart(opportunity) > bounds.pageBottom + positionEpsilon &&
			getStart(opportunity) < bounds.nextPageStart - positionEpsilon,
	);
	const printableOpportunities = usableOpportunities.filter(
		(opportunity) =>
			getStart(opportunity) > bounds.pageStart + positionEpsilon &&
			getStart(opportunity) <= bounds.pageBottom + positionEpsilon,
	);

	return {
		isComplete: false,
		opportunity: forcedOpportunity ?? printableOpportunities.at(-1) ?? marginOpportunity,
	};
}

/**
 * Fill each preview page to its latest legal block boundary.
 *
 * @param root the print-preview root
 * @param content the element whose end bounds the paginated flow
 * @param geometry the measured page geometry
 * @param measureBlockGeometry convert an element rectangle to preview coordinates
 * @param moveElementTo shift an element to a preview coordinate
 * @returns the elements shifted to a later page
 */
export function paginateAtBreakOpportunities(
	root: HTMLElement,
	content: HTMLElement,
	geometry: PageGeometry,
	measureBlockGeometry: MeasureBlockGeometry,
	moveElementTo: MoveElementTo,
): Set<HTMLElement> {
	const shiftedElements = new Set<HTMLElement>();
	let pageIndex = 0;

	for (let pass = 0; pass < maxPaginationPasses; pass += 1) {
		const contentEnd = measureBlockGeometry(content, geometry).end;
		const bounds = {
			pageStart: pageIndex * geometry.pageBlockSize + geometry.pageMarginStart,
			pageBottom: (pageIndex + 1) * geometry.pageBlockSize - geometry.pageMarginEnd,
			nextPageStart: (pageIndex + 1) * geometry.pageBlockSize + geometry.pageMarginStart,
		};
		const opportunities = getBreakOpportunities(root).toSorted(
			(first, second) =>
				measureBlockGeometry(first.after, geometry).start -
				measureBlockGeometry(second.after, geometry).start,
		);
		const selection = selectPageBreak(
			opportunities,
			contentEnd,
			bounds,
			geometry,
			measureBlockGeometry,
		);
		if (selection.isComplete) break;
		if (!selection.opportunity) {
			pageIndex += 1;
			continue;
		}

		moveElementTo(selection.opportunity.after, bounds.nextPageStart, geometry);
		shiftedElements.add(selection.opportunity.after);
		pageIndex += 1;
	}

	return shiftedElements;
}
