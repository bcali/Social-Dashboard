import { useState, useMemo } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Badge, Input } from "@/components/ui";
import { formatCompact, formatPercent } from "@/lib/format";
import type { HotelEntry, GlobalTop4Baseline } from "@/lib/social-types";

type SortKey = "engagement_rate" | "impressions" | "net_follower_growth";
type SortDir = "asc" | "desc";

interface PropertyRankingTableProps {
  hotels: HotelEntry[];
  baseline: GlobalTop4Baseline | null;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={12} className="text-[var(--text-muted)] opacity-40" />;
  if (dir === "asc") return <ArrowUp size={12} className="text-[var(--color-primary)]" />;
  return <ArrowDown size={12} className="text-[var(--color-primary)]" />;
}

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "engagement_rate", label: "Eng. Rate", align: "right" },
  { key: "impressions", label: "Impressions", align: "right" },
  { key: "net_follower_growth", label: "Followers", align: "right" },
];

export function PropertyRankingTable({ hotels, baseline }: PropertyRankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("engagement_rate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const displayed = useMemo(() => {
    let filtered = hotels;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((h) => h.name.toLowerCase().includes(q));
    }

    return [...filtered].sort((a, b) => {
      const av = a.metrics[sortKey];
      const bv = b.metrics[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [hotels, sortKey, sortDir, search]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="ui-card overflow-hidden">
      <div className="ui-section-title flex items-center justify-between">
        <span>Property Rankings</span>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotel..."
            size="sm"
            className="pl-6 w-48 text-[11px]"
          />
        </div>
      </div>

      <div className="max-h-[480px] overflow-y-auto overflow-x-auto">
        <table className="ui-table w-full">
          <thead className="sticky top-0 z-10 bg-[var(--bg-card)]">
            <tr>
              <th className="w-12">#</th>
              <th>Hotel</th>
              <th>Region</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-right cursor-pointer select-none" onClick={() => handleSort(col.key)}>
                  <span className="inline-flex items-center gap-1 justify-end">
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Pinned baseline row */}
            {baseline && (
              <tr className="ui-glow-success">
                <td className="font-mono text-[var(--text-muted)]">—</td>
                <td>
                  <span className="font-semibold text-[var(--text-primary)]">Global Top 4 Avg</span>
                  <Badge color="success" className="ml-2 text-[9px]">
                    BASELINE
                  </Badge>
                </td>
                <td className="text-[var(--text-muted)]">All</td>
                <td className="text-right font-mono">{formatPercent(baseline.engagement_rate)}</td>
                <td className="text-right font-mono">{formatCompact(baseline.impressions)}</td>
                <td className="text-right font-mono">
                  {baseline.follower_growth >= 0 ? "+" : ""}
                  {formatCompact(baseline.follower_growth)}
                </td>
              </tr>
            )}

            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--text-muted)] py-8">
                  No hotels match the current filters
                </td>
              </tr>
            ) : (
              displayed.map((hotel, i) => (
                <tr key={hotel.hotel_id}>
                  <td className="font-mono text-[var(--text-muted)]">{i + 1}</td>
                  <td className="font-semibold text-[var(--text-primary)]">{hotel.name}</td>
                  <td>
                    <Badge color="secondary">{hotel.region}</Badge>
                  </td>
                  <td className="text-right font-mono">{formatPercent(hotel.metrics.engagement_rate)}</td>
                  <td className="text-right font-mono">{formatCompact(hotel.metrics.impressions)}</td>
                  <td className="text-right font-mono">
                    {hotel.metrics.net_follower_growth >= 0 ? "+" : ""}
                    {formatCompact(hotel.metrics.net_follower_growth)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
