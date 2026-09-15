import { measureExactBlockGeometry } from "./geometry";
import type { MeasuredOpportunity, PageGeometry, PagePlan } from "./types";

export const offsetAttribute = "data-pf-print-page-break-offset";
export const offsetProperty = "--pf-print-page-break-offset";
export const pageCountProperty = "--pf-print-page-count";

/** Largest residual drift tolerated before a break is reported as inexact. */
const verificationEpsilon = 0.5;

/** Block-start of the page that a break on `pageIndex` sends content to. */
function getTargetBlockStart(pageIndex: number, geometry: PageGeometry): number {
	return (pageIndex + 1) * geometry.pageBlockSize + geometry.pageMarginStart;
}

/** Clear styles left by an earlier run so every pass starts from natural layout. */
export function resetPagination(root: HTMLElement): void {
	root.style.removeProperty(pageCountProperty);
	root.querySelectorAll<HTMLElement>(`[${offsetAttribute}]`).forEach((element) => {
		element.removeAttribute(offsetAttribute);
		element.style.removeProperty(offsetProperty);
	});
}

/**
 * Write a plan to the document in one batch.
 *
 * Every offset is computed before anything is written, so no measurement taken
 * during planning is invalidated by an earlier write.
 *
 * @returns the elements that were shifted
 */
export function applyPlan(
	plan: PagePlan,
	opportunities: readonly MeasuredOpportunity[],
	elements: readonly HTMLElement[],
	root: HTMLElement,
): Set<HTMLElement> {
	const shifted = new Set<HTMLElement>();

	for (const planned of plan.breaks) {
		const opportunity = opportunities.find((entry) => entry.index === planned.opportunityIndex);
		const element = elements[planned.opportunityIndex];
		if (!opportunity || !element) continue;

		// The shift is additional to whatever earlier breaks already moved this
		// element by, so it must come from the planner's delta and never from the
		// element's own natural position.
		const margin = opportunity.exactGap + planned.delta;

		element.style.setProperty(offsetProperty, `${margin}px`);
		element.setAttribute(offsetAttribute, "");
		shifted.add(element);
	}

	root.style.setProperty(pageCountProperty, String(plan.pageCount));
	return shifted;
}

/**
 * Re-read the shifted elements and report those that did not land where planned.
 *
 * The collapse-aware offset is exact for adjacent block siblings. Anything that
 * drifts means the layout broke an assumption of the model — a float, a nested
 * formatting context — and the previous implementation hid exactly that class of
 * problem behind a silent retry loop.
 */
export function verifyPlan(
	plan: PagePlan,
	elements: readonly HTMLElement[],
	geometry: PageGeometry,
): number[] {
	const inexact: number[] = [];

	for (const planned of plan.breaks) {
		const element = elements[planned.opportunityIndex];
		if (!element) continue;

		const expected = getTargetBlockStart(planned.pageIndex, geometry);
		const actual = measureExactBlockGeometry(element, geometry).start;
		if (Math.abs(actual - expected) > verificationEpsilon) inexact.push(planned.pageIndex);
	}

	return inexact;
}
