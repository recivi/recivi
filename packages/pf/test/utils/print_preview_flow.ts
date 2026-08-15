import assert from "node:assert";
import { test } from "node:test";

import {
	type PageGeometry,
	paginateAtBreakOpportunities,
} from "../../src/utils/print_preview/breaks";
import { FakeDocument, FakeElement } from "../helpers/print_preview";

const geometry: PageGeometry = {
	pageBlockSize: 1000,
	pageMarginStart: 100,
	pageMarginEnd: 100,
	printableBlockSize: 800,
	previewScale: 1,
	rootBlockStart: 0,
};

function paginateFakeFlow(document: FakeDocument): {
	movedElements: FakeElement[];
	shiftedElements: Set<HTMLElement>;
} {
	const movedElements: FakeElement[] = [];
	const shiftedElements = paginateAtBreakOpportunities(
		document.root as unknown as HTMLElement,
		document.content as unknown as HTMLElement,
		geometry,
		(element) => {
			const fakeElement = element as unknown as FakeElement;
			return {
				start: fakeElement.baseTop,
				size: fakeElement.height,
				end: fakeElement.baseTop + fakeElement.height,
			};
		},
		(element, targetBlockStart) => {
			const fakeElement = element as unknown as FakeElement;
			movedElements.push(fakeElement);
			fakeElement.baseTop = targetBlockStart;
		},
	);
	return { movedElements, shiftedElements };
}

test("moves a flex row as one block instead of splitting its items", () => {
	const document = new FakeDocument();
	const intro = Object.assign(new FakeElement(document), { baseTop: 100, height: 650 });
	const flexRow = Object.assign(new FakeElement(document), {
		baseTop: 800,
		display: "flex",
		height: 150,
	});
	const firstItem = Object.assign(new FakeElement(document), { baseTop: 800, height: 100 });
	const secondItem = Object.assign(new FakeElement(document), { baseTop: 850, height: 100 });

	flexRow.append(firstItem, secondItem);
	document.content.height = 950;
	document.content.append(intro, flexRow);
	document.root.append(document.content);
	document.descendants.push(document.content, intro, flexRow, firstItem, secondItem);

	const { movedElements, shiftedElements } = paginateFakeFlow(document);
	assert.strictEqual(movedElements.length, 1);
	assert.strictEqual(movedElements[0], flexRow);
	assert.strictEqual(shiftedElements.size, 1);
	assert.ok(shiftedElements.has(flexRow as unknown as HTMLElement));
});

test("prefers a printable boundary over a later boundary in the margin", () => {
	const document = new FakeDocument();
	const preceding = Object.assign(new FakeElement(document), { baseTop: 100, height: 700 });
	const printable = Object.assign(new FakeElement(document), { baseTop: 850, height: 100 });
	const margin = Object.assign(new FakeElement(document), { baseTop: 950, height: 50 });

	document.content.height = 1000;
	document.content.append(preceding, printable, margin);
	document.root.append(document.content);
	document.descendants.push(document.content, preceding, printable, margin);

	const { movedElements, shiftedElements } = paginateFakeFlow(document);
	assert.strictEqual(movedElements.length, 1);
	assert.strictEqual(movedElements[0], printable);
	assert.strictEqual(printable.baseTop, 1100);
	assert.strictEqual(margin.baseTop, 950);
	assert.strictEqual(shiftedElements.size, 1);
	assert.ok(shiftedElements.has(printable as unknown as HTMLElement));
});

test("moves a margin-starting sibling instead of splitting an avoided ancestor", () => {
	const document = new FakeDocument();
	const avoided = Object.assign(new FakeElement(document), {
		baseTop: 1100,
		breakInside: "avoid-page",
		height: 300,
	});
	const firstChild = Object.assign(new FakeElement(document), { baseTop: 1150, height: 80 });
	const secondChild = Object.assign(new FakeElement(document), { baseTop: 1250, height: 80 });
	const following = Object.assign(new FakeElement(document), { baseTop: 1950, height: 50 });

	avoided.append(firstChild, secondChild);
	document.content.height = 2000;
	document.content.append(avoided, following);
	document.root.append(document.content);
	document.descendants.push(document.content, avoided, firstChild, secondChild, following);

	const { movedElements, shiftedElements } = paginateFakeFlow(document);
	assert.strictEqual(movedElements.length, 1);
	assert.strictEqual(movedElements[0], following);
	assert.strictEqual(following.baseTop, 2100);
	assert.strictEqual(shiftedElements.size, 1);
	assert.ok(shiftedElements.has(following as unknown as HTMLElement));
});
