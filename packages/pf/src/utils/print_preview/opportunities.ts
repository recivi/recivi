import { measureBlockGeometry, measureExactBlockGeometry } from "./geometry";
import { avoidsBreakInside, isForcedBreak, scoreBreak } from "./scoring";
import type { MeasuredOpportunity, PageGeometry } from "./types";

const positionEpsilon = 0.01;

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

/** CSS initial value for `orphans` and `widows`. */
const defaultContainerLimit = 2;

export interface OpportunityScan {
	opportunities: MeasuredOpportunity[];
	/** Parallel table addressed by `MeasuredOpportunity.index`. */
	elements: HTMLElement[];
}

function parseContainerLimit(value: string): number {
	// Engines without orphans/widows support serialize these as "".
	const parsed = Math.trunc(Number(value));
	return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultContainerLimit;
}

function getRenderedChildren(parent: HTMLElement, view: Window): HTMLElement[] {
	return Array.from(parent.children).flatMap((child) => {
		const element = child as HTMLElement;
		const style = view.getComputedStyle(element);
		if (style.display === "none" || style.position === "absolute" || style.position === "fixed") {
			return [];
		}
		if (style.display === "contents") return getRenderedChildren(element, view);
		if (!blockDisplayValues.has(style.display)) return [];

		const rect = element.getBoundingClientRect();
		return rect.width > positionEpsilon || rect.height > positionEpsilon ? [element] : [];
	});
}

function getCommonAncestor(first: HTMLElement, second: HTMLElement): HTMLElement | null {
	const ancestors = new Set<HTMLElement>();
	for (let ancestor = first.parentElement; ancestor; ancestor = ancestor.parentElement) {
		ancestors.add(ancestor);
	}
	for (let ancestor = second.parentElement; ancestor; ancestor = ancestor.parentElement) {
		if (ancestors.has(ancestor)) return ancestor;
	}
	return null;
}

function countAvoidedAncestors(
	before: HTMLElement,
	after: HTMLElement,
	root: HTMLElement,
	view: Window,
): number {
	let count = 0;
	for (
		let ancestor = getCommonAncestor(before, after);
		ancestor && ancestor !== root;
		ancestor = ancestor.parentElement
	) {
		if (avoidsBreakInside(view.getComputedStyle(ancestor).breakInside)) count += 1;
	}
	return count;
}

/**
 * Block extent starting at `element` that must not be split across a boundary.
 *
 * An element asking to stay whole may be the first child of the element a break
 * lands before, in which case pushing the outer element must also clear the
 * inner one. Walking the first-child chain covers that without needing the
 * separate second pass the previous implementation ran.
 */
function measureUnbreakableLead(
	element: HTMLElement,
	geometry: PageGeometry,
	view: Window,
): { size: number; avoids: boolean } {
	const start = measureBlockGeometry(element, geometry).start;

	for (let node: HTMLElement | undefined = element; node;) {
		if (avoidsBreakInside(view.getComputedStyle(node).breakInside)) {
			return { size: measureBlockGeometry(node, geometry).end - start, avoids: true };
		}
		node = getRenderedChildren(node, view)[0];
	}

	return { size: 0, avoids: false };
}

interface ScanContext {
	root: HTMLElement;
	geometry: PageGeometry;
	view: Window;
	opportunities: MeasuredOpportunity[];
	elements: HTMLElement[];
}

/** Record every boundary between the rendered children of one block container. */
function scanContainer(parent: HTMLElement, children: HTMLElement[], context: ScanContext): void {
	const { geometry, view } = context;
	const parentStyle = view.getComputedStyle(parent);
	const containerOrphans = parseContainerLimit(parentStyle.orphans);
	const containerWidows = parseContainerLimit(parentStyle.widows);

	for (let index = 1; index < children.length; index += 1) {
		const before = children[index - 1];
		const after = children[index];
		if (!before || !after) continue;

		const beforeStyle = view.getComputedStyle(before);
		const afterStyle = view.getComputedStyle(after);
		const afterBlock = measureBlockGeometry(after, geometry);
		const exactAfter = measureExactBlockGeometry(after, geometry);
		const lead = measureUnbreakableLead(after, geometry, view);

		context.elements.push(after);
		context.opportunities.push({
			index: context.elements.length - 1,
			start: afterBlock.start,
			afterSize: lead.avoids ? lead.size : afterBlock.size,
			score: scoreBreak({
				breakAfter: beforeStyle.breakAfter,
				breakBefore: afterStyle.breakBefore,
				avoidedAncestorCount: countAvoidedAncestors(before, after, context.root, view),
				siblingsBefore: index,
				siblingsAfter: children.length - index,
				containerOrphans,
				containerWidows,
			}),
			isForced: isForcedBreak(beforeStyle.breakAfter, afterStyle.breakBefore),
			afterAvoidsInside: lead.avoids,
			collapsedGap: afterBlock.start - measureBlockGeometry(before, geometry).end,
			exactStart: exactAfter.start,
			exactGap: exactAfter.start - measureExactBlockGeometry(before, geometry).end,
		});
	}
}

/**
 * Read every break candidate out of the document in one pass.
 *
 * Nothing downstream touches the DOM, so this is the only place where layout is
 * read. Candidates come back sorted by rendered position, which is the order
 * the planner consumes them in.
 *
 * @param root the print-preview root
 * @param geometry the measured page geometry
 * @returns candidates plus the element table that maps them back to the DOM
 */
export function scanOpportunities(root: HTMLElement, geometry: PageGeometry): OpportunityScan {
	const view = root.ownerDocument.defaultView;
	if (!view) return { opportunities: [], elements: [] };

	const context: ScanContext = { root, geometry, view, opportunities: [], elements: [] };

	const visit = (parent: HTMLElement): void => {
		const children = getRenderedChildren(parent, view);
		if (blockFlowContainerDisplayValues.has(view.getComputedStyle(parent).display)) {
			scanContainer(parent, children, context);
		}
		children.forEach((child) => visit(child));
	};

	visit(root);
	context.opportunities.sort((first, second) => first.start - second.start);

	return { opportunities: context.opportunities, elements: context.elements };
}
