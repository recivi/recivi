import { applyPlan, resetPagination, verifyPlan } from "./apply";
import { measureBlockGeometry, measurePageGeometry } from "./geometry";
import { scanOpportunities } from "./opportunities";
import { planPages } from "./planner";
import { BreakScore, type PlanDiagnostics } from "./types";

export { BreakScore } from "./types";
export type {
	BlockGeometry,
	MeasuredOpportunity,
	PageGeometry,
	PagePlan,
	PlanDiagnostics,
	PlannedBreak,
} from "./types";

const contentSelector = "[data-pf-print-content]";

export interface PrintPreviewPaginationOptions {
	/** Root element representing the print sheet. Defaults to `document.body`. */
	root?: HTMLElement;
	/** Element whose block-end determines the number of preview pages. */
	content?: HTMLElement;
}

export interface PrintPreviewPaginationResult {
	pageCount: number;
	shiftedElementCount: number;
	diagnostics: PrintPreviewDiagnostics;
}

export interface PrintPreviewDiagnostics extends PlanDiagnostics {
	/** Pages whose shifted element did not land where the plan expected. */
	inexactPages: number[];
	/** Whether every page broke at a boundary that violated nothing. */
	isClean: boolean;
}

/**
 * Wait until intrinsic resource sizes can no longer change the initial layout.
 *
 * Pagination measures the document, so it must run after images without
 * intrinsic dimensions and webfonts have settled; measuring earlier reports a
 * shorter document and plans too few pages. This is the only DOM-event-aware
 * part of pagination, kept separate so that `paginatePrintPreview` stays a
 * plain measure-plan-apply pass that a caller can repeat at will.
 *
 * @param document the document to wait on, defaulting to the global one
 */
export async function waitForInitialLayout(
	document: Document | undefined = globalThis.document,
): Promise<void> {
	const view = document?.defaultView;
	if (!document || !view) return;

	// Only `complete` means `load` has already fired; a deferred module script
	// runs at `interactive`, so checking for `loading` here would skip the wait.
	const documentLoaded =
		document.readyState === "complete"
			? Promise.resolve()
			: new Promise<void>((resolve) => {
					view.addEventListener("load", () => resolve(), { once: true });
				});
	await Promise.all([document.fonts.ready, documentLoaded]);
}

/**
 * Paginate the on-screen print preview and publish its page count as
 * `--pf-print-page-count` on the root element.
 *
 * The run is three separate stages: the document is read once into plain
 * measurements, those are planned into page breaks without touching the DOM,
 * and the resulting plan is written back in a single batch. Print media is
 * unaffected, since both this and its companion styles are screen-scoped.
 *
 * The caller owns readiness: await `waitForInitialLayout` first, or the
 * measurements will be taken against a layout that images and fonts can still
 * change.
 *
 * @param options optional root and content overrides, primarily for custom layouts
 * @returns pagination statistics, or `undefined` when pagination does not apply
 */
export function paginatePrintPreview(
	options: PrintPreviewPaginationOptions = {},
): PrintPreviewPaginationResult | undefined {
	const document =
		options.root?.ownerDocument ?? options.content?.ownerDocument ?? globalThis.document;
	const view = document?.defaultView;

	if (!document || !view?.matchMedia("screen").matches) return;

	const root = options.root ?? document.body;
	const content = options.content ?? root.querySelector<HTMLElement>(contentSelector);
	if (!content) return;

	resetPagination(root);

	const geometry = measurePageGeometry(root);
	if (!geometry) return;

	const { opportunities, elements } = scanOpportunities(root, geometry);
	const contentEnd = measureBlockGeometry(content, geometry).end;

	const plan = planPages(opportunities, contentEnd, geometry);
	const shifted = applyPlan(plan, opportunities, elements, root);
	const inexactPages = verifyPlan(plan, elements, geometry);

	return {
		pageCount: plan.pageCount,
		shiftedElementCount: shifted.size,
		diagnostics: {
			...plan.diagnostics,
			inexactPages,
			isClean: plan.diagnostics.worstScore === BreakScore.PERFECT && inexactPages.length === 0,
		},
	};
}
