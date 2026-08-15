import assert from "node:assert";
import { test } from "node:test";

import { paginatePrintPreview } from "../../src/utils/print_preview";
import {
	FakeDocument,
	FakeElement,
	offsetAttribute,
	offsetProperty,
} from "../helpers/print_preview";

test("keeps a break-after block with the following visible block", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 950;

	const previous = new FakeElement(document);
	previous.baseTop = 500;
	previous.height = 340;

	const heading = new FakeElement(document);
	heading.baseTop = 850;
	heading.height = 20;
	heading.breakAfter = "avoid-page";

	const hidden = new FakeElement(document);
	hidden.display = "none";

	const following = new FakeElement(document);
	following.baseTop = 880;
	following.height = 70;

	document.content.append(previous, heading, hidden, following);
	document.root.append(document.content);
	document.descendants.push(document.content, previous, heading, hidden, following);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(heading.style.getPropertyValue(offsetProperty), "250px");
	assert.ok(heading.attributes.has(offsetAttribute));
});

test("keeps a break-before block with the preceding visible block", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 950;

	const earlier = new FakeElement(document);
	earlier.baseTop = 500;
	earlier.height = 340;

	const preceding = new FakeElement(document);
	preceding.baseTop = 850;
	preceding.height = 20;

	const following = new FakeElement(document);
	following.baseTop = 880;
	following.height = 70;
	following.breakBefore = "avoid-page";

	document.content.append(earlier, preceding, following);
	document.root.append(document.content);
	document.descendants.push(document.content, earlier, preceding, following);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(preceding.style.getPropertyValue(offsetProperty), "250px");
	assert.ok(preceding.attributes.has(offsetAttribute));
});

test("honors a forced page break before content that otherwise fits", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 700;

	const previous = new FakeElement(document);
	previous.baseTop = 100;
	previous.height = 100;

	const forced = new FakeElement(document);
	forced.baseTop = 300;
	forced.height = 400;
	forced.breakBefore = "page";

	document.content.append(previous, forced);
	document.root.append(document.content);
	document.descendants.push(document.content, previous, forced);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(forced.style.getPropertyValue(offsetProperty), "800px");
	assert.ok(forced.attributes.has(offsetAttribute));
});

test("relaxes avoidance when an avoided group is taller than a printable page", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 1300;

	const avoided = new FakeElement(document);
	avoided.baseTop = 100;
	avoided.height = 1200;
	avoided.breakInside = "avoid-page";

	const first = new FakeElement(document);
	first.baseTop = 100;
	first.height = 500;

	const second = new FakeElement(document);
	second.baseTop = 700;
	second.height = 600;

	avoided.append(first, second);
	document.content.append(avoided);
	document.root.append(document.content);
	document.descendants.push(document.content, avoided, first, second);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(second.style.getPropertyValue(offsetProperty), "400px");
	assert.ok(second.attributes.has(offsetAttribute));
});

test("selects the latest rendered boundary instead of the last traversed boundary", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 950;

	const earlySection = new FakeElement(document);
	earlySection.baseTop = 100;
	earlySection.height = 600;

	const earlyChild = new FakeElement(document);
	earlyChild.baseTop = 100;
	earlyChild.height = 500;

	const lateNestedChild = new FakeElement(document);
	lateNestedChild.baseTop = 700;
	lateNestedChild.height = 50;

	const penultimateSection = new FakeElement(document);
	penultimateSection.baseTop = 750;
	penultimateSection.height = 50;

	const finalSection = new FakeElement(document);
	finalSection.baseTop = 850;
	finalSection.height = 100;

	earlySection.append(earlyChild, lateNestedChild);
	document.content.append(earlySection, penultimateSection, finalSection);
	document.root.append(document.content);
	document.descendants.push(
		document.content,
		earlySection,
		earlyChild,
		lateNestedChild,
		penultimateSection,
		finalSection,
	);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(finalSection.style.getPropertyValue(offsetProperty), "250px");
	assert.strictEqual(lateNestedChild.style.getPropertyValue(offsetProperty), "");
});

test("does not treat inline siblings as block break opportunities", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 950;

	const previous = new FakeElement(document);
	previous.baseTop = 100;
	previous.height = 600;

	const paragraph = new FakeElement(document);
	paragraph.baseTop = 750;
	paragraph.height = 200;

	const firstInline = new FakeElement(document);
	firstInline.baseTop = 750;
	firstInline.height = 80;
	firstInline.display = "inline";

	const secondInline = new FakeElement(document);
	secondInline.baseTop = 850;
	secondInline.height = 100;
	secondInline.display = "inline";

	paragraph.append(firstInline, secondInline);
	document.content.append(previous, paragraph);
	document.root.append(document.content);
	document.descendants.push(document.content, previous, paragraph, firstInline, secondInline);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(paragraph.style.getPropertyValue(offsetProperty), "350px");
	assert.strictEqual(secondInline.style.getPropertyValue(offsetProperty), "");
});

test("treats break-inside avoid as page avoidance", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 950;

	const avoided = new FakeElement(document);
	avoided.baseTop = 700;
	avoided.height = 250;
	avoided.breakInside = "avoid";

	document.content.append(avoided);
	document.root.append(document.content);
	document.descendants.push(document.content, avoided);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 2, shiftedElementCount: 1 });
	assert.strictEqual(avoided.style.getPropertyValue(offsetProperty), "400px");
	assert.ok(avoided.attributes.has(offsetAttribute));
});

test("rechecks avoided blocks after a boundary shift changes their page", async () => {
	const document = new FakeDocument();
	document.root.height = 1000;
	document.content.height = 1700;

	const header = new FakeElement(document);
	header.baseTop = 100;
	header.height = 40;

	const remainder = new FakeElement(document);
	remainder.baseTop = 150;
	remainder.height = 1550;

	const intro = new FakeElement(document);
	intro.baseTop = 150;
	intro.height = 700;

	const wrapper = new FakeElement(document);
	wrapper.baseTop = 850;
	wrapper.height = 850;

	const avoided = new FakeElement(document);
	avoided.baseTop = 1200;
	avoided.height = 500;
	avoided.breakInside = "avoid-page";

	wrapper.append(avoided);
	remainder.append(intro, wrapper);
	document.content.append(header, remainder);
	document.root.append(document.content);
	document.descendants.push(document.content, header, remainder, intro, wrapper, avoided);

	const result = await paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	});

	assert.deepStrictEqual(result, { pageCount: 3, shiftedElementCount: 2 });
	assert.strictEqual(wrapper.style.getPropertyValue(offsetProperty), "250px");
	assert.strictEqual(avoided.style.getPropertyValue(offsetProperty), "650px");
	assert.strictEqual(remainder.style.getPropertyValue(offsetProperty), "");
	assert.ok(avoided.attributes.has(offsetAttribute));
});
