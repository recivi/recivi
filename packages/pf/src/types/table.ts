import type { Renderer, RendererRegistry } from './renderers'

/** information about a column in the table */
export interface ColumnSpec {
  title: string
  renderer: Renderer
  class?: string
}

/**
 * the shape of a row based on the renders from the given column specifications;
 * It ensures that each field in the row matches the props required by that
 * column's renderer component.
 */
type RowData<ColumnSpecMap extends Record<string, ColumnSpec>> = {
  [K in keyof ColumnSpecMap]: ColumnSpecMap[K]['renderer'] extends infer R
    ? R extends Renderer
      ? RendererRegistry[R]
      : never
    : never
}

/**
 * a row in the table; The `RowData` generic type is intentionally broad as we
 * cannot know at the time what the column spec will be. We will use a narrower
 * type for `RowData` when defining the table.
 */
interface Row<RowData extends Record<string, unknown>> {
  groupId: string
  data: RowData
  attrs?: Record<string, string | undefined>
}

/**
 * a table with column specifications and rows; One of the columns from the
 * column specifications must be designated as the expanding column.
 */
export interface Table<ColumnSpecMap extends Record<string, ColumnSpec>> {
  columnSpecs: ColumnSpecMap
  rows: Row<RowData<ColumnSpecMap>>[]
  expandingColumn: keyof ColumnSpecMap
}

/**
 * Define a table with column specifications and rows.
 *
 * @param columnSpecs the specifications for each column
 * @param rows the data for the rows of the table
 * @param expandingColumn the column which will expand to fill available width
 * @returns the well-defined table
 */
export function defineTable<ColumnSpecMap extends Record<string, ColumnSpec>>(
  columnSpecs: ColumnSpecMap,
  rows: Row<RowData<ColumnSpecMap>>[],
  expandingColumn: keyof ColumnSpecMap,
): Table<ColumnSpecMap> {
  return {
    columnSpecs,
    rows,
    expandingColumn,
  }
}
