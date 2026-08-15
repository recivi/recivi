/* oxlint-disable max-classes-per-file -- Separate DOM test doubles keep their behavior explicit. */

export const offsetAttribute = "data-pf-print-page-break-offset";
export const offsetProperty = "--pf-print-page-break-offset";
export const pageCountProperty = "--pf-print-page-count";

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

export class FakeElement {
	readonly attributes = new Set<string>();
	readonly children: FakeElement[] = [];
	readonly style = new FakeStyle();
	readonly ownerDocument: FakeDocument;
	parentElement: FakeElement | undefined;
	offsetWidth = 100;
	layoutWidth: number | undefined;
	baseTop = 0;
	height = 0;
	display = "block";
	position = "static";
	breakAfter = "auto";
	breakBefore = "auto";
	breakInside = "auto";
	isRuler = false;

	constructor(ownerDocument: FakeDocument) {
		this.ownerDocument = ownerDocument;
	}

	append(...children: FakeElement[]): void {
		for (const child of children) {
			child.parentElement = this;
			this.children.push(child);
		}
	}

	get nextElementSibling(): FakeElement | undefined {
		const siblings = this.parentElement?.children;
		if (!siblings) return;
		return siblings[siblings.indexOf(this) + 1];
	}

	get previousElementSibling(): FakeElement | undefined {
		const siblings = this.parentElement?.children;
		if (!siblings) return;
		return siblings[siblings.indexOf(this) - 1];
	}

	getBoundingClientRect(): DOMRect {
		const ownMargin = Number(this.style.getPropertyValue(offsetProperty).replace("px", "")) || 0;
		const margin = this.parentElement
			? this.ownerDocument.descendants
					.filter((element) => element.parentElement && element.baseTop <= this.baseTop)
					.reduce(
						(total, element) =>
							total +
							(Number(element.style.getPropertyValue(offsetProperty).replace("px", "")) || 0),
						0,
					)
			: ownMargin;
		const scale = this.ownerDocument.previewScale;
		const top = (this.baseTop + margin) * scale;
		const inlineBlockSize = (this.style as unknown as { blockSize?: string }).blockSize;
		const rulerHeight = inlineBlockSize?.startsWith("var(")
			? 1000
			: Number(inlineBlockSize?.replace("px", ""));
		const descendantMargins =
			this.children.length > 0
				? this.ownerDocument.descendants
						.filter((element) => element !== this && this.contains(element))
						.reduce(
							(total, element) =>
								total +
								(Number(element.style.getPropertyValue(offsetProperty).replace("px", "")) || 0),
							0,
						)
				: 0;
		const height = (this.isRuler ? rulerHeight : this.height + descendantMargins) * scale;
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

	contains(descendant: FakeElement): boolean {
		for (let ancestor = descendant.parentElement; ancestor; ancestor = ancestor.parentElement) {
			if (ancestor === this) return true;
		}
		return false;
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

	remove(): void {
		const siblings = this.parentElement?.children;
		if (!siblings) return;
		const index = siblings.indexOf(this);
		if (index >= 0) siblings.splice(index, 1);
		this.parentElement = undefined;
	}

	removeAttribute(name: string): void {
		this.attributes.delete(name);
	}

	setAttribute(name: string): void {
		this.attributes.add(name);
	}
}

export class FakeDocument {
	previewScale = 1;
	readyState: DocumentReadyState = "complete";
	serializedScale = 1;
	readonly fonts = { ready: Promise.resolve() };
	readonly loadListeners: Array<() => void> = [];
	readonly descendants: FakeElement[] = [];
	readonly defaultView = {
		addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
			if (type !== "load") return;
			this.loadListeners.push(() => {
				if (typeof listener === "function") listener(new Event("load"));
				else listener.handleEvent(new Event("load"));
			});
		},
		getComputedStyle: (element: FakeElement) => {
			if (element.isRuler) {
				const inlineBlockSize = (element.style as unknown as { blockSize?: string }).blockSize;
				return {
					blockSize: inlineBlockSize?.startsWith("var(") ? "1000px" : inlineBlockSize,
					display: element.display,
					position: element.position,
				};
			}
			if (element === this.root) {
				return {
					breakAfter: element.breakAfter,
					breakBefore: element.breakBefore,
					breakInside: element.breakInside,
					display: element.display,
					paddingBlockEnd: "100px",
					paddingBlockStart: "100px",
					position: element.position,
					transform: `matrix(${this.serializedScale}, 0, 0, ${this.serializedScale}, 0, 0)`,
				};
			}
			return {
				breakAfter: element.breakAfter,
				breakBefore: element.breakBefore,
				breakInside: element.breakInside,
				display: element.display,
				marginBlockStart: element.style.getPropertyValue(offsetProperty) || "0px",
				position: element.position,
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

	dispatchLoad(): void {
		this.readyState = "complete";
		this.loadListeners.splice(0).forEach((listener) => listener());
	}
}
