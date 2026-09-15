// The empty export marks this file as a module. Without it, the file is a
// global script and the `declare global` block is silently ignored (no TS
// error, no merging). Oxlint's `require-module-specifiers` documents an
// exception for exactly this, but does not implement it, and autofixes the
// export away.

// oxlint-disable-next-line unicorn/require-module-specifiers
export {};

declare global {
	interface DocumentEventMap {
		"pf:paginated-print-preview": CustomEvent<
			import("./utils/print_preview").PrintPreviewPaginationResult | undefined
		>;
	}

	interface Window {
		/**
		 * Whether print preview pagination and its synchronous listeners have
		 * settled. Set by the `Print` layout, read by the PDF capture job.
		 */
		pfPrintPreviewSettled?: boolean;
	}
}
