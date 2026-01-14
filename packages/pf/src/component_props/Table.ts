import type { ColumnSpec, Table } from '../types/table'
import type { BaseProps } from './base'

export interface TableProps<
  ColumnSpecMap extends Record<string, ColumnSpec>,
> extends BaseProps {
  /** the table data to render */
  table: Table<ColumnSpecMap>
  /** inline-start-cell classes */
  inlineStartCellClass?: string
  /** inline-end-cell classes */
  inlineEndCellClass?: string
}
