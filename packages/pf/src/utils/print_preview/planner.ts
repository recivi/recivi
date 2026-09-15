import {
	BreakScore,
	type MeasuredOpportunity,
	type PageGeometry,
	type PagePlan,
	type PlannedBreak,
} from "./types";

const positionEpsilon = 0.01;

/** Guards against a page that cannot be advanced, e.g. oversized unbreakable content. */
const maxPages = 1000;

/**
 * Fraction of a page's usable block size the planner may leave empty to honour
 * a soft constraint.
 *
 * Block-level orphans and widows are a preference, not a rule: a fragmenter that
 * cannot split a block has no way to satisfy them exactly, so letting them push
 * a break far up the page costs far more than the stranding they prevent.
 */
const maxSoftBacktrack = 0.1;

interface PageBounds {
	pageStart: number;
	pageBottom: number;
	nextPageStart: number;
}

function getBounds(pageIndex: number, geometry: PageGeometry): PageBounds {
	return {
		pageStart: pageIndex * geometry.pageBlockSize + geometry.pageMarginStart,
		pageBottom: (pageIndex + 1) * geometry.pageBlockSize - geometry.pageMarginEnd,
		nextPageStart: (pageIndex + 1) * geometry.pageBlockSize + geometry.pageMarginStart,
	};
}

/**
 * Find an element that must not straddle this page's end but currently does.
 *
 * Oversized elements are ignored: no break can rescue something taller than the
 * printable area, and pushing it would loop forever.
 */
function findStraddler(
	candidates: MeasuredOpportunity[],
	offset: number,
	bounds: PageBounds,
	geometry: PageGeometry,
): MeasuredOpportunity | undefined {
	return candidates.find((candidate) => {
		if (!candidate.afterAvoidsInside) return false;
		if (candidate.afterSize > geometry.printableBlockSize + positionEpsilon) return false;

		const start = candidate.start + offset;
		return start + candidate.afterSize > bounds.pageBottom + positionEpsilon;
	});
}

/** Candidates that fall inside this page's printable area. */
function getCandidates(
	opportunities: readonly MeasuredOpportunity[],
	offset: number,
	bounds: PageBounds,
): MeasuredOpportunity[] {
	return opportunities.filter((opportunity) => {
		const start = opportunity.start + offset;
		return (
			start > bounds.pageStart + positionEpsilon && start <= bounds.pageBottom + positionEpsilon
		);
	});
}

/** A forced break anywhere before the next page starts, margins included. */
function findForced(
	opportunities: readonly MeasuredOpportunity[],
	offset: number,
	bounds: PageBounds,
): MeasuredOpportunity | undefined {
	return opportunities.find((opportunity) => {
		const start = opportunity.start + offset;
		return (
			opportunity.isForced &&
			start > bounds.pageStart + positionEpsilon &&
			start < bounds.nextPageStart - positionEpsilon
		);
	});
}

/** Drop candidates beyond a straddling element, which must not be left behind. */
function capTo(
	candidates: MeasuredOpportunity[],
	straddler: MeasuredOpportunity | undefined,
): MeasuredOpportunity[] {
	if (!straddler) return candidates;
	return candidates.filter((candidate) => candidate.start <= straddler.start);
}

function latest(candidates: MeasuredOpportunity[]): MeasuredOpportunity | undefined {
	let best: MeasuredOpportunity | undefined;
	for (const candidate of candidates) {
		if (!best || candidate.start > best.start) best = candidate;
	}
	return best;
}

/**
 * Choose the boundary that ends a page.
 *
 * Filling the page comes first. Score may pull the break earlier, but only by
 * `maxSoftBacktrack` — otherwise a soft preference near the top of a page can
 * outrank a perfectly good boundary near the bottom and waste most of a sheet.
 *
 * Splitting a box that asked to stay whole is the one hard constraint, so those
 * boundaries are used only when the page offers nothing else.
 */
function selectBreak(
	candidates: MeasuredOpportunity[],
	offset: number,
	bounds: PageBounds,
): MeasuredOpportunity | undefined {
	const forced = candidates.find((candidate) => candidate.isForced);
	if (forced) return forced;

	const allowed = candidates.filter(
		(candidate) => candidate.score < BreakScore.VIOLATING_BREAK_AVOID,
	);
	const pool = allowed.length > 0 ? allowed : candidates;

	const last = latest(pool);
	if (!last || last.score === BreakScore.PERFECT) return last;

	// Budget the backtrack against the block size this page actually holds, not
	// against a whole sheet. A straddling unbreakable block can cap a page well
	// short of its end, and a tenth of a full sheet is then most of the room that
	// is left — enough to strand content that fitted comfortably.
	const usableBlockSize = last.start + offset - bounds.pageStart;
	const limit = last.start - maxSoftBacktrack * usableBlockSize;
	const cleaner = pool.filter(
		(candidate) => candidate.score < last.score && candidate.start >= limit,
	);

	return latest(cleaner) ?? last;
}

/** Sheets needed to cover the flow, including the final page's end margin. */
function countPages(contentEnd: number, geometry: PageGeometry): number {
	const occupied = contentEnd + geometry.pageMarginEnd;
	return Math.max(1, Math.ceil((occupied - positionEpsilon) / geometry.pageBlockSize));
}

/**
 * Lay content out across pages without touching the DOM.
 *
 * Shifting an element to the next page moves everything after it by the same
 * amount, so a single running `offset` reproduces the effect of every earlier
 * break. That is what lets this stage be a pure function of measurements.
 *
 * @param opportunities every candidate boundary, sorted by block-start
 * @param contentEnd block-end of the flow being paginated
 * @param geometry the measured page geometry
 * @returns the breaks to apply, the resulting page count, and what was compromised
 */
export function planPages(
	opportunities: readonly MeasuredOpportunity[],
	contentEnd: number,
	geometry: PageGeometry,
): PagePlan {
	const breaks: PlannedBreak[] = [];
	const lastResortPages: number[] = [];
	const compromisedPages: number[] = [];

	let offset = 0;
	let pageIndex = 0;
	let worstScore: BreakScore = BreakScore.PERFECT;

	for (; pageIndex < maxPages; pageIndex += 1) {
		const bounds = getBounds(pageIndex, geometry);
		const onThisPage = getCandidates(opportunities, offset, bounds);
		const forced = findForced(opportunities, offset, bounds);

		if (contentEnd + offset <= bounds.pageBottom + positionEpsilon && !forced) break;

		// A straddling unbreakable element caps how far this page may fill.
		const straddler = findStraddler(onThisPage, offset, bounds, geometry);
		const chosen = forced ?? selectBreak(capTo(onThisPage, straddler), offset, bounds);

		if (!chosen) {
			// Nothing legal on this page. Let it overflow rather than loop.
			lastResortPages.push(pageIndex);
			worstScore = BreakScore.LAST_RESORT;
			continue;
		}

		const score = chosen.isForced ? BreakScore.PERFECT : chosen.score;
		if (score > worstScore) worstScore = score;
		if (score >= BreakScore.VIOLATING_BREAK_AVOID) compromisedPages.push(pageIndex);

		// Measured exactly, but relative to the offset every earlier break already
		// introduced: the shift written for this element is additional to those.
		const delta = bounds.nextPageStart - (chosen.exactStart + offset);
		breaks.push({ opportunityIndex: chosen.index, pageIndex, score, delta });
		offset += delta;
	}

	const pageCount = countPages(contentEnd + offset, geometry);

	return {
		breaks,
		pageCount,
		diagnostics: { lastResortPages, compromisedPages, worstScore },
	};
}
