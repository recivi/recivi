/** Page measurements shared by every stage, in untransformed CSS pixels. */
export interface PageGeometry {
	pageBlockSize: number;
	pageMarginStart: number;
	pageMarginEnd: number;
	printableBlockSize: number;
	/**
	 * Ratio between rendered and untransformed pixels. The preview scales the
	 * sheet to match screen PPI, so every rectangle must be divided by this
	 * before it can be compared against page geometry.
	 */
	previewScale: number;
	rootBlockStart: number;
	devicePixelRatio: number;
}

export interface BlockGeometry {
	start: number;
	size: number;
	end: number;
}

/**
 * A break candidate reduced to plain numbers.
 *
 * Every field is captured in a single DOM read pass so that planning never
 * touches the document. `index` addresses the parallel element table returned
 * alongside these, which is the only thing that maps a plan back to the DOM.
 */
export interface MeasuredOpportunity {
	index: number;
	/** Block-start of the element that would begin the next page. */
	start: number;
	/** Block size of that element, used to detect straddling. */
	afterSize: number;
	score: BreakScore;
	isForced: boolean;
	/** Whether the following element asks to stay whole on one page. */
	afterAvoidsInside: boolean;
	/**
	 * Rendered gap between the previous sibling's border box and this one.
	 *
	 * Shifting replaces `margin-block-start` outright, and adjacent sibling
	 * margins collapse to their maximum, so writing a larger value always wins.
	 */
	collapsedGap: number;
	/**
	 * Unrounded counterparts of `start` and `collapsedGap`.
	 *
	 * Planning uses the device-pixel-snapped values so break decisions stay
	 * stable, but the shift itself must be computed from exact measurements —
	 * snapping both terms loses up to a pixel each and lands the element short.
	 */
	exactStart: number;
	exactGap: number;
}

/** Ordered worst-to-best, mirroring CSS Fragmentation break preferences. */
export const BreakScore = {
	PERFECT: 0,
	VIOLATING_CONTAINER_ORPHANS_WIDOWS: 1,
	VIOLATING_BREAK_AVOID: 2,
	LAST_RESORT: 3,
} as const;

export type BreakScore = (typeof BreakScore)[keyof typeof BreakScore];

export interface PlannedBreak {
	/** Position in the `MeasuredOpportunity` array this break was chosen from. */
	opportunityIndex: number;
	/** Page this break terminates, counting from zero. */
	pageIndex: number;
	score: BreakScore;
	/** Extra block-start margin needed to push the element to the next page. */
	delta: number;
}

/**
 * What the planner had to compromise on. An empty diagnostic means every page
 * broke at a boundary that violated nothing.
 */
export interface PlanDiagnostics {
	/** Pages with no usable candidate at all; content was left to overflow. */
	lastResortPages: number[];
	/** Pages that accepted a break violating an explicit avoid. */
	compromisedPages: number[];
	worstScore: BreakScore;
}

export interface PagePlan {
	breaks: PlannedBreak[];
	pageCount: number;
	diagnostics: PlanDiagnostics;
}
