import { subDays, startOfYear, format } from "date-fns";
import { Filter, RotateCcw } from "lucide-react";
import { Button, DateInput } from "@/components/ui";

export interface ToggleGroup {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterBarProps {
  pendingDateRange: { start: string | null; end: string | null };
  onDateRangeChange: (range: { start: string | null; end: string | null }) => void;
  toggleGroups: ToggleGroup[];
  pendingToggles: Record<string, Set<string>>;
  onToggle: (group: string, value: string) => void;
  hasPendingChanges: boolean;
  hasFilters: boolean;
  onApply: () => void;
  onReset: () => void;
}

const DATE_PRESETS = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "YTD", days: 0 },
  { label: "All", days: -1 },
];

function toDateString(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function FilterBar({
  pendingDateRange,
  onDateRangeChange,
  toggleGroups,
  pendingToggles,
  onToggle,
  hasPendingChanges,
  hasFilters,
  onApply,
  onReset,
}: FilterBarProps) {
  const handlePreset = (preset: (typeof DATE_PRESETS)[number]) => {
    if (preset.days === -1) {
      onDateRangeChange({ start: null, end: null });
    } else if (preset.days === 0) {
      onDateRangeChange({ start: toDateString(startOfYear(new Date())), end: toDateString(new Date()) });
    } else {
      onDateRangeChange({ start: toDateString(subDays(new Date(), preset.days)), end: toDateString(new Date()) });
    }
  };

  return (
    <div className="ui-card px-4 py-3 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        <Filter size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Filters</span>
      </div>

      {/* Date presets */}
      <div className="flex items-center gap-1">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            className="px-2 py-1 text-[11px] font-mono rounded border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <div className="flex items-center gap-1">
        <DateInput
          value={pendingDateRange.start ?? ""}
          onChange={(e) => onDateRangeChange({ ...pendingDateRange, start: e.target.value || null })}
          className="w-32 text-[11px]"
        />
        <span className="text-[var(--text-muted)] text-xs">&ndash;</span>
        <DateInput
          value={pendingDateRange.end ?? ""}
          onChange={(e) => onDateRangeChange({ ...pendingDateRange, end: e.target.value || null })}
          className="w-32 text-[11px]"
        />
      </div>

      {/* Toggle groups */}
      {toggleGroups.map((group) => (
        <div key={group.name} className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {group.label}:
          </span>
          <div className="flex flex-wrap gap-1">
            {group.options.map((opt) => {
              const selected = pendingToggles[group.name]?.has(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => onToggle(group.name, opt.value)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                    selected
                      ? "bg-[var(--color-primary-dim)] border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1 text-[11px]">
            <RotateCcw size={12} />
            Reset
          </Button>
        )}
        {hasPendingChanges && (
          <Button size="sm" onClick={onApply} className="text-[11px]">
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}
