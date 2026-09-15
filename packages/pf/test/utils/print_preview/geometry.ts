import assert from "node:assert";
import { test } from "node:test";

import { parseCssLength, roundToDevicePixels } from "../../../src/utils/print_preview/geometry";

test("floors to whole pixels at device pixel ratio 1", () => {
	assert.strictEqual(roundToDevicePixels(56.6929, 1), 56);
	assert.strictEqual(roundToDevicePixels(56, 1), 56);
});

test("snaps to the half-pixel grid at device pixel ratio 2", () => {
	assert.strictEqual(roundToDevicePixels(56.6929, 2), 56.5);
	assert.strictEqual(roundToDevicePixels(56.8, 2), 57);
});

test("stops subpixel overcount accumulating across a page of lines", () => {
	const lineHeight = 18.4;
	const lines = 40;
	const raw = lineHeight * lines;
	const snapped = roundToDevicePixels(lineHeight, 1) * lines;

	assert.strictEqual(snapped, 720);
	assert.ok(raw - snapped >= 15, "unsnapped lines drift by more than half a line over a page");
});

test("leaves non-finite measurements untouched", () => {
	assert.ok(Number.isNaN(roundToDevicePixels(Number.NaN, 1)));
	assert.strictEqual(roundToDevicePixels(Number.POSITIVE_INFINITY, 2), Number.POSITIVE_INFINITY);
});

test("parses computed lengths that carry a unit", () => {
	assert.strictEqual(parseCssLength("56.6929px"), 56.6929);
	assert.strictEqual(parseCssLength("0px"), 0);
	assert.ok(Number.isNaN(parseCssLength("auto")));
});
