import type { BaseProps } from "../../types/props";

export interface CommsProps extends BaseProps {
	/** filter profiles that match the given tag */
	filterTag?: string | undefined;
}
