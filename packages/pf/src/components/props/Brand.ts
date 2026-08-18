import type { BaseProps } from "../../types/props";
import type { AnchorProps } from "./Anchor";
import type { IconProps } from "./Icon";

interface BrandWithIcon {
	/** information about the brand's icon */
	icon: IconProps;
	/** the brand's display name */
	name?: string | undefined;
}

interface BrandWithName {
	/** information about the brand's icon */
	icon?: IconProps | undefined;
	/** the brand's display name */
	name: string;
}

export type BrandProps = BaseProps & {
	/** an optional anchor to wrap the brand in */
	anchor?: AnchorProps | undefined;
} & (BrandWithIcon | BrandWithName);
