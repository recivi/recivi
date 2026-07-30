/**
 * Get a debounced version of a function that will only be called after a
 * certain amount of time has passed since the last call.
 *
 * @param callback the function to debounce
 * @param time the amount of time to wait before calling the function
 * @returns the debounced version of the function
 */
export function debounce(callback: () => void, time: number) {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	return () => {
		if (timeout !== undefined) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(callback, time);
	};
}
