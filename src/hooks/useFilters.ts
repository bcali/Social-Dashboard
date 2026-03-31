import { useCallback, useMemo, useState } from "react";

type DateRange = { start: string | null; end: string | null };
type ToggleSets = Record<string, Set<string>>;

function emptyToggles(groups: string[]): ToggleSets {
  const result: ToggleSets = {};
  for (const g of groups) result[g] = new Set();
  return result;
}

function cloneToggles(toggles: ToggleSets): ToggleSets {
  const result: ToggleSets = {};
  for (const [k, v] of Object.entries(toggles)) result[k] = new Set(v);
  return result;
}

function togglesEqual(a: ToggleSets, b: ToggleSets): boolean {
  for (const key of Object.keys(a)) {
    const sa = a[key];
    const sb = b[key];
    if (!sa || !sb || sa.size !== sb.size) return false;
    for (const v of sa) {
      if (!sb.has(v)) return false;
    }
  }
  return true;
}

export function useFilters(toggleGroupNames: string[]) {
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>({ start: null, end: null });
  const [pendingToggles, setPendingToggles] = useState<ToggleSets>(() => emptyToggles(toggleGroupNames));

  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({ start: null, end: null });
  const [appliedToggles, setAppliedToggles] = useState<ToggleSets>(() => emptyToggles(toggleGroupNames));

  const onToggle = useCallback((group: string, value: string) => {
    setPendingToggles((prev) => {
      const next = cloneToggles(prev);
      if (!next[group]) next[group] = new Set();
      if (next[group].has(value)) {
        next[group].delete(value);
      } else {
        next[group].add(value);
      }
      return next;
    });
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedDateRange({ ...pendingDateRange });
    setAppliedToggles(cloneToggles(pendingToggles));
  }, [pendingDateRange, pendingToggles]);

  const resetFilters = useCallback(() => {
    const empty = emptyToggles(toggleGroupNames);
    const emptyDate: DateRange = { start: null, end: null };
    setPendingDateRange(emptyDate);
    setPendingToggles(empty);
    setAppliedDateRange(emptyDate);
    setAppliedToggles(emptyToggles(toggleGroupNames));
  }, [toggleGroupNames]);

  const hasFilters = useMemo(() => {
    if (appliedDateRange.start !== null || appliedDateRange.end !== null) return true;
    for (const set of Object.values(appliedToggles)) {
      if (set.size > 0) return true;
    }
    return false;
  }, [appliedDateRange, appliedToggles]);

  const hasPendingChanges = useMemo(() => {
    if (pendingDateRange.start !== appliedDateRange.start) return true;
    if (pendingDateRange.end !== appliedDateRange.end) return true;
    return !togglesEqual(pendingToggles, appliedToggles);
  }, [pendingDateRange, appliedDateRange, pendingToggles, appliedToggles]);

  return {
    pendingDateRange,
    onDateRangeChange: setPendingDateRange,
    pendingToggles,
    onToggle,
    dateRange: appliedDateRange,
    selectedToggles: appliedToggles,
    applyFilters,
    resetFilters,
    hasFilters,
    hasPendingChanges,
  };
}
