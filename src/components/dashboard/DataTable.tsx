import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T & string;
  label: string;
  align?: "left" | "right";
  sortable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
}

export type SortDir = "asc" | "desc";

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
  emptyMessage?: string;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={12} className="text-[var(--text-muted)] opacity-40" />;
  if (dir === "asc") return <ArrowUp size={12} className="text-[var(--color-primary)]" />;
  return <ArrowDown size={12} className="text-[var(--color-primary)]" />;
}

// biome-ignore lint/suspicious/noExplicitAny: generic table accepts any row shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  sortKey,
  sortDir,
  onSort,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="ui-table w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align === "right" ? "text-right" : "text-left"}
                style={col.sortable ? { cursor: "pointer", userSelect: "none" } : undefined}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-[var(--text-muted)] py-8">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={(row.id as string) ?? i}>
                {columns.map((col) => (
                  <td key={col.key} className={col.align === "right" ? "text-right font-mono" : ""}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
