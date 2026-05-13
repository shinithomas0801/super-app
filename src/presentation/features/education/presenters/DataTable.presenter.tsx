import { Table } from "@/components";

type Column<T> = {
  header: string;
  accessor: (row: T, rowIndex: number) => string | number | null | undefined;
};

type Props<T> = {
  title: string;
  description?: string;
  columns: Column<T>[];
  rows: T[];
  emptyLabel?: string;
};

export function DataTablePresenter<T>({
  title,
  description,
  columns,
  rows,
  emptyLabel = "No rows yet.",
}: Props<T>) {
  return (
    <Table<T>
      title={title}
      description={description}
      columns={columns.map((col) => ({
        header: col.header,
        accessor: (row: T, rowIndex: number) => col.accessor(row, rowIndex),
      }))}
      rows={rows}
      emptyLabel={emptyLabel}
    />
  );
}
