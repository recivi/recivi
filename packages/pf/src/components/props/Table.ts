import type { BaseProps } from "../../types/props";
import type { ColumnSpec, Table } from "../../types/table";

export interface TableProps<ColumnSpecMap extends Record<string, ColumnSpec>> extends BaseProps {
	/** the table data to render */
	table: Table<ColumnSpecMap>;
	/** inline-start-cell classes */
	inlineStartCellClass?: string;
	/** inline-end-cell classes */
	inlineEndCellClass?: string;
}
