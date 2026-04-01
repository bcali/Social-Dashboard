import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { Filter, RotateCcw } from "lucide-react";
import { Button, DateInput, Select, SelectItem } from "@/components/ui";

interface SocialFilterBarProps {
  /** Date range (pending) */
  pendingDateRange: { start: string | null; end: string | null };
  onDateRangeChange: (range: { start: string | null; end: string | null }) => void;

  /** Region filter */
  region: string;
  onRegionChange: (value: string) => void;
  availableRegions: string[];

  /** Brand filter */
  brand: string;
  onBrandChange: (value: string) => void;
  availableBrands: string[];

  /** Actions */
  hasPendingChanges: boolean;
  hasFilters: boolean;
  onApply: () => void;
  onReset: () => void;
}

const DATE_PRESETS = [
  { label: "This Month", offset: 0 },
  { label: "Last Month", offset: 1 },
  { label: "Last 3 Mo", offset: 3 },
  { label: "All", offset: -1 },
];

function toDateString(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function SocialFilterBar({
  pendingDateRange,
  onDateRangeChange,
  region,
  onRegionChange,
  availableRegions,
  brand,
  onBrandChange,
  availableBrands,
  hasPendingChanges,
  hasFilters,
  onApply,
  onReset,
}: SocialFilterBarProps) {
  const handlePreset = (preset: (typeof DATE_PRESETS)[number]) => {
    if (preset.offset === -1) {
      onDateRangeChange({ start: null, end: null });
      return;
    }
    const now = new Date();
    const target = preset.offset === 0 ? now : subMonths(now, preset.offset);
    const start = startOfMonth(target);
    const end = preset.offset === 0 ? now : endOfMonth(target);
    onDateRangeChange({ start: toDateString(start), end: toDateString(end) });
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
            type="button"
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

      {/* Region */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Region:</span>
        <Select value={region} onValueChange={onRegionChange} className="text-[11px]">
          <SelectItem value="all">All</SelectItem>
          {availableRegions.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Brand */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Brand:</span>
        <Select value={brand} onValueChange={onBrandChange} className="text-[11px]">
          <SelectItem value="all">All</SelectItem>
          {availableBrands.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </Select>
      </div>

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
