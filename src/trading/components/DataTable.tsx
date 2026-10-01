import type {
  Key,
  ReactNode,
} from "react";

export type DataColumn<Row> = {
  readonly id: string;
  readonly header: ReactNode;
  readonly align?: "left" | "center" | "right";
  readonly width?: string;
  readonly className?: string;
  readonly render: (
    row: Row,
    index: number
  ) => ReactNode;
};

export type DataTableProps<Row> = {
  readonly columns: readonly DataColumn<Row>[];
  readonly rows: readonly Row[];
  readonly rowKey: (
    row: Row,
    index: number
  ) => Key;
  readonly empty?: ReactNode;
  readonly dense?: boolean;
  readonly onRowClick?: (
    row: Row,
    index: number
  ) => void;
  readonly className?: string;
};

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  empty = "No data available",
  dense = true,
  onRowClick,
  className = "",
}: DataTableProps<Row>) {
  const template = columns
    .map((column) => column.width || "minmax(0, 1fr)")
    .join(" ");

  return (
    <div
      className={[
        "ti-data-table",
        dense ? "ti-data-table--dense" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="table"
    >
      <div
        className="ti-data-table__header"
        role="row"
        style={{
          gridTemplateColumns: template,
        }}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            role="columnheader"
            className={[
              "ti-data-table__cell",
              `ti-data-table__cell--${column.align || "left"}`,
              column.className || "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {column.header}
          </div>
        ))}
      </div>

      <div
        className="ti-data-table__body"
        role="rowgroup"
      >
        {rows.length === 0 ? (
          <div className="ti-data-table__empty">
            {empty}
          </div>
        ) : (
          rows.map((row, index) => {
            const clickable = Boolean(onRowClick);

            return (
              <div
                key={rowKey(row, index)}
                role="row"
                tabIndex={clickable ? 0 : undefined}
                className={[
                  "ti-data-table__row",
                  clickable
                    ? "ti-data-table__row--clickable"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  gridTemplateColumns: template,
                }}
                onClick={
                  onRowClick
                    ? () => onRowClick(row, index)
                    : undefined
                }
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          onRowClick(row, index);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <div
                    key={column.id}
                    role="cell"
                    className={[
                      "ti-data-table__cell",
                      `ti-data-table__cell--${column.align || "left"}`,
                      column.className || "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {column.render(row, index)}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DataTable;
