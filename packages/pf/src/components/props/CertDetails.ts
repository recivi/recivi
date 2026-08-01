import type { Cert } from "@recivi/schema";

import type { BaseProps } from "./base";

export interface CertDetailsProps extends BaseProps {
	/** the cert to render */
	cert: Cert;
	/** the number by which to offset the heading level */
	headingOffset?: number;
}
