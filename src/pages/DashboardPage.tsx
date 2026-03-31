import { useMemo, useState } from "react";
import { ErrorBoundary, Badge } from "@/components/ui";
import { KpiCards } from "@/components/dashboard";
import { FilterBar, type ToggleGroup } from "@/components/dashboard/FilterBar";
import { DataTable, type Column, type SortDir } from "@/components/dashboard/DataTable";
import { useFetchJson } from "@/hooks/useFetchJson";
import { useFilters } from "@/hooks/useFilters";
import { formatCurrency } from "@/lib/format";

interface DataRecord {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
  date: string;
  region: string;
}

const STATUS_BADGE: Record<string, "primary" | "secondary" | "success" | "danger" | "warning"> = {
  Complete: "success",
  "In Progress": "secondary",
  "At Risk": "warning",
  Blocked: "danger",
  "Not Started": "primary",
};

const TOGGLE_GROUP_NAMES = ["category", "status", "region"];

const COLUMNS: Column<DataRecord>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "category", label: "Category", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (v) => <Badge color={STATUS_BADGE[v as string] ?? "primary"}>{v as string}</Badge>,
  },
  {
    key: "value",
    label: "Value",
    align: "right",
    sortable: true,
    render: (v) => formatCurrency(v as number),
  },
  { key: "date", label: "Date", sortable: true },
  { key: "region", label: "Region", sortable: true },
];

function unique(records: DataRecord[], key: keyof DataRecord): { value: string; label: string }[] {
  const seen = new Set<string>();
  for (const r of records) {
    seen.add(String(r[key]));
  }
  return Array.from(seen)
    .sort()
    .map((v) => ({ value: v, label: v }));
}

export function DashboardPage() {
  const { data: records } = useFetchJson<DataRecord[]>("data/records.json");
  const filters = useFilters(TOGGLE_GROUP_NAMES);
  const [sortKey, setSortKey] = useState<string | null>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleGroups: ToggleGroup[] = useMemo(() => {
    if (!records) return [];
    return [
      { name: "category", label: "Category", options: unique(records, "category") },
      { name: "status", label: "Status", options: unique(records, "status") },
      { name: "region", label: "Region", options: unique(records, "region") },
    ];
  }, [records]);

  const filteredData = useMemo(() => {
    if (!records) return [];
    let result = records;

    // Date filter
    if (filters.dateRange.start) {
      result = result.filter((r) => r.date >= filters.dateRange.start!);
    }
    if (filters.dateRange.end) {
      result = result.filter((r) => r.date <= filters.dateRange.end!);
    }

    // Toggle filters
    for (const group of TOGGLE_GROUP_NAMES) {
      const selected = filters.selectedToggles[group];
      if (selected && selected.size > 0) {
        result = result.filter((r) => selected.has(String(r[group as keyof DataRecord])));
      }
    }

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey as keyof DataRecord];
        const bv = b[sortKey as keyof DataRecord];
        if (av === bv) return 0;
        const cmp = av < bv ? -1 : 1;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [records, filters.dateRange, filters.selectedToggles, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ErrorBoundary name="KPI Cards">
        <KpiCards />
      </ErrorBoundary>

      <ErrorBoundary name="Filters">
        <FilterBar
          pendingDateRange={filters.pendingDateRange}
          onDateRangeChange={filters.onDateRangeChange}
          toggleGroups={toggleGroups}
          pendingToggles={filters.pendingToggles}
          onToggle={filters.onToggle}
          hasPendingChanges={filters.hasPendingChanges}
          hasFilters={filters.hasFilters}
          onApply={filters.applyFilters}
          onReset={filters.resetFilters}
        />
      </ErrorBoundary>

      <ErrorBoundary name="Data Table">
        <DataTable
          columns={COLUMNS}
          data={filteredData}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          emptyMessage="No records match the current filters"
        />
      </ErrorBoundary>
    </div>
  );
}
