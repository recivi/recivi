type Clsx = undefined | string | Record<string, boolean> | Clsx[];

export interface BaseProps {
	/** additional CSS classes to apply to the component */
	class?: Clsx;
	/** additional HTML attributes to apply to the component */
	[key: string]: unknown;
}
