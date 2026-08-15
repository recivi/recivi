import assert from "node:assert";
import { test } from "node:test";

import { paginatePrintPreview } from "../../src/utils/print_preview";
import {
	FakeDocument,
	FakeElement,
	offsetAttribute,
	offsetProperty,
	pageCountProperty,
} from "../helpers/print_preview";

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

test("waits for load before measuring resource-dependent layout", async () => {
	const document = new FakeDocument();
	document.readyState = "loading";
	document.root.height = 1000;
	document.content.height = 800;
	let settled = false;

	const pagination = paginatePrintPreview({
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	}).then((result) => {
		settled = true;
		return result;
	});

	await new Promise<void>((resolve) => {
		setImmediate(resolve);
	});
	assert.strictEqual(settled, false);

	document.content.height = 950;
	document.dispatchLoad();

	assert.deepStrictEqual(await pagination, { pageCount: 2, shiftedElementCount: 0 });
});

test("clears previous offsets before repeat pagination", async () => {
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

	const following = new FakeElement(document);
	following.baseTop = 880;
	following.height = 70;

	document.content.append(previous, heading, following);
	document.root.append(document.content);
	document.descendants.push(document.content, previous, heading, following);

	const options = {
		root: document.root as unknown as HTMLElement,
		content: document.content as unknown as HTMLElement,
	};
	const firstResult = await paginatePrintPreview(options);
	const secondResult = await paginatePrintPreview(options);

	assert.deepStrictEqual(firstResult, { pageCount: 2, shiftedElementCount: 1 });
	assert.deepStrictEqual(secondResult, firstResult);
	assert.strictEqual(heading.style.getPropertyValue(offsetProperty), "250px");
	assert.strictEqual(
		document.descendants.filter((element) => element.attributes.has(offsetAttribute)).length,
		1,
	);
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
