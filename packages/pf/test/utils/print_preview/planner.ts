import assert from "node:assert";
import { test } from "node:test";

import { planPages } from "../../../src/utils/print_preview/planner";
import {
	BreakScore,
	type MeasuredOpportunity,
	type PageGeometry,
} from "../../../src/utils/print_preview/types";

/** A4-ish page: 1000 tall, 100 margins, so 800 of printable block size. */
const geometry: PageGeometry = {
	pageBlockSize: 1000,
	pageMarginStart: 100,
	pageMarginEnd: 100,
	printableBlockSize: 800,
	previewScale: 1,
	rootBlockStart: 0,
	devicePixelRatio: 1,
};

function opportunity(overrides: Partial<MeasuredOpportunity> & { index: number; start: number }) {
	return {
		afterSize: 50,
		score: BreakScore.PERFECT,
		isForced: false,
		afterAvoidsInside: false,
		collapsedGap: 0,
		exactStart: overrides.start,
		exactGap: 0,
		...overrides,
	} satisfies MeasuredOpportunity;
}

test("content that fits on one page produces no breaks", () => {
	const plan = planPages([opportunity({ index: 0, start: 300 })], 700, geometry);

	assert.deepStrictEqual(plan.breaks, []);
	assert.strictEqual(plan.pageCount, 1);
	assert.strictEqual(plan.diagnostics.worstScore, BreakScore.PERFECT);
});

test("fills a page to its latest usable boundary", () => {
	const opportunities = [
		opportunity({ index: 0, start: 300 }),
		opportunity({ index: 1, start: 600 }),
		opportunity({ index: 2, start: 880 }),
	];

	const plan = planPages(opportunities, 1200, geometry);

	assert.strictEqual(plan.breaks.length, 1);
	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 2);
	assert.strictEqual(plan.breaks[0]?.delta, 1100 - 880);
});

test("prefers a lesser violation over a worse one at the same page", () => {
	const opportunities = [
		opportunity({ index: 0, start: 400, score: BreakScore.VIOLATING_BREAK_AVOID }),
		opportunity({
			index: 1,
			start: 500,
			score: BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS,
		}),
	];

	const plan = planPages(opportunities, 1500, geometry);

	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 1);
	assert.strictEqual(plan.breaks[0]?.score, BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS);
	assert.deepStrictEqual(plan.diagnostics.compromisedPages, []);
});

test("takes a violating break rather than overflowing when nothing better exists", () => {
	const opportunities = [
		opportunity({ index: 0, start: 500, score: BreakScore.VIOLATING_BREAK_AVOID }),
	];

	const plan = planPages(opportunities, 1200, geometry);

	assert.strictEqual(plan.breaks.length, 1);
	assert.strictEqual(plan.diagnostics.worstScore, BreakScore.VIOLATING_BREAK_AVOID);
	assert.deepStrictEqual(plan.diagnostics.compromisedPages, [0]);
});

test("fills the page rather than backtracking far for a better score", () => {
	// Regression: score used to outrank position outright, so a perfect break near
	// the top of the page beat a soft-violating one near the bottom and wasted it.
	const opportunities = [
		opportunity({ index: 0, start: 207 }),
		opportunity({ index: 1, start: 880, score: BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS }),
	];

	const plan = planPages(opportunities, 1500, geometry);

	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 1);
});

test("backtracks a short distance for a cleaner break", () => {
	const opportunities = [
		opportunity({ index: 0, start: 850 }),
		opportunity({ index: 1, start: 880, score: BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS }),
	];

	const plan = planPages(opportunities, 1500, geometry);

	// 850 is within 10% of the printable size, so the perfect break is worth it.
	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 0);
});

test("scales the backtrack budget to the space the page can actually hold", () => {
	// Regression: the budget was a fraction of a whole sheet, so on a page cut
	// short by an unbreakable block it could still reach far above the best
	// boundary and strand content that fitted comfortably.
	const opportunities = [
		opportunity({ index: 0, start: 200 }),
		opportunity({ index: 1, start: 280, score: BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS }),
		opportunity({
			index: 2,
			start: 300,
			afterSize: 700,
			afterAvoidsInside: true,
			score: BreakScore.VIOLATING_BREAK_AVOID,
		}),
	];

	const plan = planPages(opportunities, 1000, geometry);

	// The straddler caps the page at 300, leaving only 200 of usable block size,
	// so backtracking 80 of it to 200 costs far more than the stranding it avoids.
	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 1);
});

test("never splits an avoided box while any other boundary exists", () => {
	const opportunities = [
		opportunity({ index: 0, start: 300 }),
		opportunity({ index: 1, start: 900, score: BreakScore.VIOLATING_BREAK_AVOID }),
	];

	const plan = planPages(opportunities, 1500, geometry);

	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 0);
});

test("reports a last-resort page when no candidate exists at all", () => {
	const plan = planPages([], 2500, geometry);

	assert.deepStrictEqual(plan.breaks, []);
	assert.strictEqual(plan.diagnostics.worstScore, BreakScore.LAST_RESORT);
	assert.deepStrictEqual(plan.diagnostics.lastResortPages, [0, 1]);
	assert.strictEqual(plan.pageCount, 3);
});

test("a forced break wins over a better-scoring later boundary", () => {
	const opportunities = [
		opportunity({ index: 0, start: 300, isForced: true }),
		opportunity({ index: 1, start: 850 }),
	];

	const plan = planPages(opportunities, 1500, geometry);

	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 0);
	assert.strictEqual(plan.breaks[0]?.score, BreakScore.PERFECT);
});

test("caps a page at an element that would otherwise straddle its end", () => {
	const opportunities = [
		opportunity({ index: 0, start: 400 }),
		opportunity({ index: 1, start: 700, afterSize: 300, afterAvoidsInside: true }),
	];

	const plan = planPages(opportunities, 1600, geometry);

	// Breaking at 700 clears the unbreakable block; 400 would strand it.
	assert.strictEqual(plan.breaks[0]?.opportunityIndex, 1);
});

test("ignores a straddler too tall to fit on any page", () => {
	const opportunities = [
		opportunity({ index: 0, start: 400 }),
		opportunity({ index: 1, start: 700, afterSize: 2000, afterAvoidsInside: true }),
	];

	const plan = planPages(opportunities, 3000, geometry);

	assert.ok(plan.breaks.length > 0);
	assert.ok(plan.pageCount >= 3);
});

test("later breaks account for the shift introduced by earlier ones", () => {
	const opportunities = [
		opportunity({ index: 0, start: 700 }),
		opportunity({ index: 1, start: 1400 }),
	];

	const plan = planPages(opportunities, 2200, geometry);

	assert.strictEqual(plan.breaks.length, 2);
	assert.strictEqual(plan.breaks[0]?.delta, 1100 - 700);
	// The second candidate has already moved by the first delta.
	assert.strictEqual(plan.breaks[1]?.delta, 2100 - (1400 + 400));
});

test("terminates on content that can never be advanced", () => {
	const plan = planPages([], Number.MAX_SAFE_INTEGER, geometry);

	assert.strictEqual(plan.diagnostics.worstScore, BreakScore.LAST_RESORT);
	assert.ok(Number.isFinite(plan.pageCount));
});
