import assert from "node:assert";
import { test } from "node:test";

import {
	avoidsBreakInside,
	isForcedBreak,
	scoreBreak,
	type BreakSides,
} from "../../../src/utils/print_preview/scoring";
import { BreakScore } from "../../../src/utils/print_preview/types";

function sides(overrides: Partial<BreakSides> = {}): BreakSides {
	return {
		breakAfter: "auto",
		breakBefore: "auto",
		avoidedAncestorCount: 0,
		siblingsBefore: 3,
		siblingsAfter: 3,
		containerOrphans: 2,
		containerWidows: 2,
		...overrides,
	};
}

test("an unconstrained boundary is perfect", () => {
	assert.strictEqual(scoreBreak(sides()), BreakScore.PERFECT);
});

test("explicit avoidance on either side violates break-avoid", () => {
	assert.strictEqual(
		scoreBreak(sides({ breakAfter: "avoid-page" })),
		BreakScore.VIOLATING_BREAK_AVOID,
	);
	assert.strictEqual(scoreBreak(sides({ breakBefore: "avoid" })), BreakScore.VIOLATING_BREAK_AVOID);
});

test("an avoided ancestor spanning the boundary violates break-avoid", () => {
	assert.strictEqual(
		scoreBreak(sides({ avoidedAncestorCount: 1 })),
		BreakScore.VIOLATING_BREAK_AVOID,
	);
});

test("stranding a lone sibling violates container orphans or widows", () => {
	assert.strictEqual(
		scoreBreak(sides({ siblingsBefore: 1 })),
		BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS,
	);
	assert.strictEqual(
		scoreBreak(sides({ siblingsAfter: 1 })),
		BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS,
	);
});

test("ignores orphans and widows a container is too small to satisfy", () => {
	// Two children cannot leave two behind and carry two forward.
	const tooSmall = sides({ siblingsBefore: 1, siblingsAfter: 1 });
	assert.strictEqual(scoreBreak(tooSmall), BreakScore.PERFECT);
});

test("enforces orphans and widows once the container is large enough", () => {
	const satisfiable = sides({ siblingsBefore: 1, siblingsAfter: 3 });
	assert.strictEqual(scoreBreak(satisfiable), BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS);
});

test("a forced break outranks everything it would otherwise violate", () => {
	const forced = sides({ breakAfter: "page", breakBefore: "avoid", siblingsBefore: 1 });
	assert.strictEqual(scoreBreak(forced), BreakScore.PERFECT);
});

test("explicit avoidance outranks stranding", () => {
	const both = sides({ breakAfter: "avoid-page", siblingsBefore: 1 });
	assert.strictEqual(scoreBreak(both), BreakScore.VIOLATING_BREAK_AVOID);
});

test("recognises forced and avoided keywords", () => {
	assert.ok(isForcedBreak("page", "auto"));
	assert.ok(isForcedBreak("auto", "recto"));
	assert.ok(!isForcedBreak("auto", "avoid"));
	assert.ok(avoidsBreakInside("avoid-page"));
	assert.ok(!avoidsBreakInside("auto"));
});
