import assert from "node:assert/strict";
import { suite, test } from "node:test";

import {
	getUrlFromPattern,
	getUrlFromSlug,
	prefixBase,
	unprefixBase,
} from "../../src/utils/project_context";

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

void suite("getUrlFromSlug", () => {
	const testCases = [
		["/", "ignore", "directory", "index", "/"],
		["/", "ignore", "directory", "page", "/page/"],
		["/base", "ignore", "directory", "index", "/base/"],
		["/base/", "ignore", "directory", "page", "/base/page/"],

		["/", "always", "directory", "index", "/"],
		["/", "always", "directory", "page", "/page/"],
		["/base", "always", "directory", "index", "/base/"],
		["/base/", "always", "directory", "page", "/base/page/"],

		["/", "ignore", "file", "index", "/"],
		["/", "ignore", "file", "page", "/page.html"],
		["/base", "ignore", "file", "index", "/base/"],
		["/base/", "ignore", "file", "page", "/base/page.html"],

		["/", "never", "file", "index", "/"],
		["/", "never", "file", "page", "/page.html"],
		["/base", "never", "file", "index", "/base/"],
		["/base/", "never", "file", "page", "/base/page.html"],
	] as const;
	testCases.forEach(([base, trailingSlash, buildFormat, pageId, expected]) => {
		void test(`base: ${base}, trailingSlash: ${trailingSlash}, buildFormat: ${buildFormat}, pageId: ${pageId}`, () => {
			const projectContext = { base, trailingSlash, build: { format: buildFormat } };
			assert.equal(getUrlFromSlug(projectContext, pageId), expected);
		});
	});
});

void suite("getUrlFromPattern", () => {
	const testCases = [
		["/", "ignore", "directory", "/main", "/main/"],
		["/", "ignore", "directory", "/main/sub/item", "/main/sub/item/"],
		["/base", "ignore", "directory", "/main", "/base/main/"],
		["/base/", "ignore", "directory", "/main/sub/item", "/base/main/sub/item/"],

		["/", "always", "directory", "/main", "/main/"],
		["/", "always", "directory", "/main/sub/item", "/main/sub/item/"],
		["/base", "always", "directory", "/main", "/base/main/"],
		["/base/", "always", "directory", "/main/sub/item", "/base/main/sub/item/"],

		["/", "ignore", "file", "/main", "/main.html"],
		["/", "ignore", "file", "/main/sub/item", "/main/sub/item.html"],
		["/base", "ignore", "file", "/main", "/base/main.html"],
		["/base/", "ignore", "file", "/main/sub/item", "/base/main/sub/item.html"],

		["/", "never", "file", "/main", "/main.html"],
		["/", "never", "file", "/main/sub/item", "/main/sub/item.html"],
		["/base", "never", "file", "/main", "/base/main.html"],
		["/base/", "never", "file", "/main/sub/item", "/base/main/sub/item.html"],
	] as const;
	testCases.forEach(([base, trailingSlash, buildFormat, pattern, expected]) => {
		void test(`base: ${base}, trailingSlash: ${trailingSlash}, buildFormat: ${buildFormat}, pattern: ${pattern}`, () => {
			const projectContext = { base, trailingSlash, build: { format: buildFormat } };
			assert.equal(getUrlFromPattern(projectContext, pattern), expected);
		});
	});
});
