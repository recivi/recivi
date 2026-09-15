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

/** Wait until intrinsic resource sizes can no longer change the initial layout. */
async function waitForInitialLayout(document: Document, view: Window): Promise<void> {
	const documentLoaded =
		document.readyState === "loading"
			? new Promise<void>((resolve) => {
					view.addEventListener("load", () => resolve(), { once: true });
				})
			: Promise.resolve();
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
 * @param options optional root and content overrides, primarily for custom layouts
 * @returns pagination statistics, or `undefined` when pagination does not apply
 */
export async function paginatePrintPreview(
	options: PrintPreviewPaginationOptions = {},
): Promise<PrintPreviewPaginationResult | undefined> {
	const document =
		options.root?.ownerDocument ?? options.content?.ownerDocument ?? globalThis.document;
	const view = document?.defaultView;

	if (!document || !view?.matchMedia("screen").matches) return;

	await waitForInitialLayout(document, view);

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
