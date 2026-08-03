import assert from "node:assert";
import { test } from "node:test";

import { paginatePrintPreview } from "../../src/utils/print_preview";

/* oxlint-disable max-classes-per-file -- Separate DOM test doubles keep their behavior explicit. */

const offsetAttribute = "data-pf-print-page-break-offset";
const offsetProperty = "--pf-print-page-break-offset";
const pageCountProperty = "--pf-print-page-count";

class FakeStyle {
	readonly #properties = new Map<string, string>();

	getPropertyValue(name: string): string {
		return this.#properties.get(name) ?? "";
	}

	removeProperty(name: string): string {
		const value = this.getPropertyValue(name);
		this.#properties.delete(name);
		return value;
	}

	setProperty(name: string, value: string): void {
		this.#properties.set(name, value);
	}
}

class FakeElement {
	readonly attributes = new Set<string>();
	readonly style = new FakeStyle();
	readonly ownerDocument: FakeDocument;
	offsetWidth = 100;
	layoutWidth: number | undefined;
	baseTop = 0;
	height = 0;
	breakInside = "auto";
	isRuler = false;

	constructor(ownerDocument: FakeDocument) {
		this.ownerDocument = ownerDocument;
	}

	append(): void {}

	getBoundingClientRect(): DOMRect {
		const margin = Number(this.style.getPropertyValue(offsetProperty).replace("px", "")) || 0;
		const scale = this.ownerDocument.previewScale;
		const top = (this.baseTop + margin) * scale;
		const inlineBlockSize = (this.style as unknown as { blockSize?: string }).blockSize;
		const rulerHeight = inlineBlockSize?.startsWith("var(")
			? 1000
			: Number(inlineBlockSize?.replace("px", ""));
		const height = (this.isRuler ? rulerHeight : this.height) * scale;
		const width = (this.layoutWidth ?? this.offsetWidth) * scale;
		return {
			bottom: top + height,
			height,
			left: 0,
			right: width,
			top,
			width,
			x: 0,
			y: top,
			toJSON: () => ({}),
		};
	}

	querySelector(): FakeElement | undefined {
		return this.ownerDocument.content;
	}

	querySelectorAll(selector: string): FakeElement[] {
		if (selector === "*") return this.ownerDocument.descendants;
		if (selector === `[${offsetAttribute}]`) {
			return this.ownerDocument.descendants.filter((element) =>
				element.attributes.has(offsetAttribute),
			);
		}
		return [];
	}

	remove(): void {}

	removeAttribute(name: string): void {
		this.attributes.delete(name);
	}

	setAttribute(name: string): void {
		this.attributes.add(name);
	}
}

class FakeDocument {
	previewScale = 1;
	serializedScale = 1;
	readonly fonts = { ready: Promise.resolve() };
	readonly descendants: FakeElement[] = [];
	readonly defaultView = {
		getComputedStyle: (element: FakeElement) => {
			if (element.isRuler) {
				const inlineBlockSize = (element.style as unknown as { blockSize?: string }).blockSize;
				return { blockSize: inlineBlockSize?.startsWith("var(") ? "1000px" : inlineBlockSize };
			}
			if (element === this.root) {
				return {
					paddingBlockEnd: "100px",
					paddingBlockStart: "100px",
					transform: `matrix(${this.serializedScale}, 0, 0, ${this.serializedScale}, 0, 0)`,
				};
			}
			return {
				breakInside: element.breakInside,
				marginBlockStart: element.style.getPropertyValue(offsetProperty) || "0px",
			};
		},
		matchMedia: () => ({ matches: true }),
	};
	readonly root = new FakeElement(this);
	readonly content = new FakeElement(this);

	createElement(): FakeElement {
		const ruler = new FakeElement(this);
		ruler.isRuler = true;
		return ruler;
	}
}

test("paginates geometry expressed as computed pixel lengths", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 1500;

	const avoided = new FakeElement(document);
	avoided.baseTop = 850;
	avoided.height = 100;
	avoided.breakInside = "avoid-page";
	document.descendants.push(avoided);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(document.root.style.getPropertyValue(pageCountProperty), "2");
	assert.strictEqual(avoided.style.getPropertyValue(offsetProperty), "250px");
	assert.ok(avoided.attributes.has(offsetAttribute));
});

test("does not add a phantom page when transformed content ends at the page boundary", async () => {
	const document = new FakeDocument();
	document.previewScale = 1.14583;
	document.serializedScale = 1.14583;
	document.root.offsetWidth = 794;
	document.root.layoutWidth = 793.7;
	document.root.height = 1000;
	document.content.height = 900;

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 1, shiftedElementCount: 0 });
	assert.strictEqual(document.root.style.getPropertyValue(pageCountProperty), "1");
});

test("moves avoided blocks out of page margin gaps", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 1800;

	const bottomMarginBlock = new FakeElement(document);
	bottomMarginBlock.baseTop = 950;
	bottomMarginBlock.height = 50;
	bottomMarginBlock.breakInside = "avoid-page";

	const topMarginBlock = new FakeElement(document);
	topMarginBlock.baseTop = 1050;
	topMarginBlock.height = 50;
	topMarginBlock.breakInside = "avoid-page";

	document.descendants.push(bottomMarginBlock, topMarginBlock);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 2 });
	assert.strictEqual(bottomMarginBlock.style.getPropertyValue(offsetProperty), "150px");
	assert.strictEqual(topMarginBlock.style.getPropertyValue(offsetProperty), "50px");
});

test("uses rendered scale precision across multiple pages", async () => {
	const document = new FakeDocument();
	document.previewScale = 1.145833374;
	document.serializedScale = 1.14583;
	document.root.height = 4000;
	document.content.height = 3900;

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 4, shiftedElementCount: 0 });
	assert.strictEqual(document.root.style.getPropertyValue(pageCountProperty), "4");
});
