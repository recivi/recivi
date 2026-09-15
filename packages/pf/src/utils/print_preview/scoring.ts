import { BreakScore } from "./types";

const avoidedBreakValues = new Set(["avoid", "avoid-page"]);
const forcedPageBreakValues = new Set(["page", "left", "right", "recto", "verso"]);

export interface BreakSides {
	breakAfter: string;
	breakBefore: string;
	/** Ancestors spanning the boundary that ask to stay whole. */
	avoidedAncestorCount: number;
	/** Rendered siblings kept on the current page, including `before`. */
	siblingsBefore: number;
	/** Rendered siblings carried to the next page, including `after`. */
	siblingsAfter: number;
	containerOrphans: number;
	containerWidows: number;
}

export function isForcedBreak(breakAfter: string, breakBefore: string): boolean {
	return forcedPageBreakValues.has(breakAfter) || forcedPageBreakValues.has(breakBefore);
}

export function avoidsBreakInside(breakInside: string): boolean {
	return avoidedBreakValues.has(breakInside);
}

/**
 * Rank a boundary between two block siblings.
 *
 * A forced break is always taken, so it scores `PERFECT` regardless of what
 * else the boundary violates. Explicit avoidance outranks stranding because an
 * author asking to keep blocks together is a stronger signal than a container
 * losing a lone child.
 *
 * Note this never returns `LAST_RESORT`: that is a property of a page with no
 * candidates at all, which only the planner can observe.
 */
export function scoreBreak(sides: BreakSides): BreakScore {
	if (isForcedBreak(sides.breakAfter, sides.breakBefore)) return BreakScore.PERFECT;

	if (
		avoidedBreakValues.has(sides.breakAfter) ||
		avoidedBreakValues.has(sides.breakBefore) ||
		sides.avoidedAncestorCount > 0
	) {
		return BreakScore.VIOLATING_BREAK_AVOID;
	}

	// A container too small to satisfy both limits cannot violate them: enforcing
	// an impossible rule would reject every boundary inside it and push the whole
	// container to the next page, wasting the rest of the current one.
	const isSatisfiable =
		sides.siblingsBefore + sides.siblingsAfter >= sides.containerOrphans + sides.containerWidows;

	if (
		isSatisfiable &&
		(sides.siblingsBefore < sides.containerOrphans || sides.siblingsAfter < sides.containerWidows)
	) {
		return BreakScore.VIOLATING_CONTAINER_ORPHANS_WIDOWS;
	}

	return BreakScore.PERFECT;
}
