import React from "react";
import { cn } from "@/lib/utils";

export type TableColumn<T> = {
  id?: string;
  header: React.ReactNode;
  accessor: (row: T, rowIndex: number) => React.ReactNode;
  cellClassName?: string;
};

export interface TableProps<T> {
  /** Page-level heading; omit when the parent already renders a title (e.g. CRUD screens). */
  title?: string;
  description?: string;
  columns: TableColumn<T>[];
  rows: T[];
  emptyLabel?: string;
  getRowKey?: (row: T, index: number) => React.Key;
  getRowProps?: (
    row: T,
    index: number
  ) => React.HTMLAttributes<HTMLTableRowElement> | undefined;
  bodyRowClassName?: string;
}

function columnKey<T>(col: TableColumn<T>, index: number): string {
  if (col.id) return col.id;
  if (typeof col.header === "string") return col.header;
  return `col-${index}`;
}

export function Table<T>({
  title,
  description,
  columns,
  rows,
  emptyLabel = "No rows yet.",
  getRowKey,
  getRowProps,
  bodyRowClassName,
}: TableProps<T>) {
  const showHeading = Boolean(
    (title?.trim().length ?? 0) > 0 || (description?.trim().length ?? 0) > 0
  );

  return (
    <div>
      {showHeading ? (
        <div className="mb-6">
          {title ? (
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, colIdx) => (
                <th
                  key={columnKey(col, colIdx)}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-sm text-gray-500"
                  colSpan={columns.length}
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const extra = getRowProps?.(row, idx) ?? {};
                const { className: rowClassFromProps, ...rowRest } = extra;
                return (
                  <tr
                    key={getRowKey?.(row, idx) ?? idx}
                    className={cn(
                      "hover:bg-gray-50",
                      bodyRowClassName,
                      rowClassFromProps
                    )}
                    {...rowRest}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={columnKey(col, colIdx)}
                        className={cn(
                          "px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap break-words max-w-xs",
                          col.cellClassName
                        )}
                      >
                        {col.accessor(row, idx) ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
