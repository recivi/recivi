import assert from "node:assert/strict";
import { suite, test } from "node:test";

import { normalizeSlash, prefixBase, unprefixBase } from "../../src/utils/project_context";

void suite("prefixBase", () => {
	const testCases = [
		["empty", "without slashes", { base: "/" }, "path", "/path"],
		["empty", "with leading slash", { base: "/" }, "/path", "/path"],
		["empty", "with trailing slash", { base: "/" }, "path/", "/path/"],
		["empty", "with both slashes", { base: "/" }, "/path/", "/path/"],
		["without trailing slash", "without slashes", { base: "/base" }, "path", "/base/path"],
		["without trailing slash", "with leading slash", { base: "/base" }, "/path", "/base/path"],
		["without trailing slash", "with trailing slash", { base: "/base" }, "path/", "/base/path/"],
		["without trailing slash", "with both slashes", { base: "/base" }, "/path/", "/base/path/"],
		["with trailing slash", "without slashes", { base: "/base/" }, "path", "/base/path"],
		["with trailing slash", "with leading slash", { base: "/base/" }, "/path", "/base/path"],
		["with trailing slash", "with trailing slash", { base: "/base/" }, "path/", "/base/path/"],
		["with trailing slash", "with both slashes", { base: "/base/" }, "/path/", "/base/path/"],
	] as const;
	testCases.forEach(([baseType, pathType, projectContext, path, expected]) => {
		void test(`handles base (${baseType}) and path (${pathType})`, () => {
			assert.equal(prefixBase(projectContext, path), expected);
		});
	});
});

void suite("unprefixBase", () => {
	const testCases = [
		["empty", "without slashes", { base: "/" }, "/path", "/path"],
		["empty", "with leading slash", { base: "/" }, "/path", "/path"],
		["empty", "with trailing slash", { base: "/" }, "/path/", "/path/"],
		["empty", "with both slashes", { base: "/" }, "/path/", "/path/"],
		["without trailing slash", "without slashes", { base: "/base" }, "/base/path", "/path"],
		["without trailing slash", "with leading slash", { base: "/base" }, "/base/path", "/path"],
		["without trailing slash", "with trailing slash", { base: "/base" }, "/base/path/", "/path/"],
		["without trailing slash", "with both slashes", { base: "/base" }, "/base/path/", "/path/"],
		["with trailing slash", "without slashes", { base: "/base/" }, "/base/path", "/path"],
		["with trailing slash", "with leading slash", { base: "/base/" }, "/base/path", "/path"],
		["with trailing slash", "with trailing slash", { base: "/base/" }, "/base/path/", "/path/"],
		["with trailing slash", "with both slashes", { base: "/base/" }, "/base/path/", "/path/"],
	] as const;
	testCases.forEach(([baseType, pathType, projectContext, path, expected]) => {
		void test(`handles base (${baseType}) and path (${pathType})`, () => {
			assert.equal(unprefixBase(projectContext, path), expected);
		});
	});
});

void suite("normalizeSlash", () => {
	const testCases = [
		["removes trailing slash if 'never'", { trailingSlash: "never" }, "/path/", "/path"],
		["does nothing if 'never' and no slash", { trailingSlash: "never" }, "/path", "/path"],
		["adds trailing slash if 'always'", { trailingSlash: "always" }, "/path", "/path/"],
		["does nothing if 'always' and slash", { trailingSlash: "always" }, "/path/", "/path/"],
		["does nothing if 'ignore' and slash", { trailingSlash: "ignore" }, "/path/", "/path/"],
		["does nothing if 'ignore' and no slash", { trailingSlash: "ignore" }, "/path", "/path"],
	] as const;
	testCases.forEach(([name, projectContext, path, expected]) => {
		void test(name, () => {
			assert.equal(normalizeSlash(projectContext, path), expected);
		});
	});
});
