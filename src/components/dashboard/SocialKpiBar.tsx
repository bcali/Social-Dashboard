import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, Value, Sparkline } from "@/components/ui";
import { formatCompact, formatPercent } from "@/lib/format";
import type { AggregateMetrics, WeeklySnapshot } from "@/lib/social-types";

interface KpiDef {
  key: string;
  label: string;
  format: (v: number) => string;
  extract: (m: AggregateMetrics) => number;
  extractWeekly?: (w: WeeklySnapshot) => number;
  showSign?: boolean;
}

const KPI_DEFS: KpiDef[] = [
  {
    key: "impressions",
    label: "Impressions",
    format: formatCompact,
    extract: (m) => m.impressions,
    extractWeekly: (w) => w.impressions,
  },
  {
    key: "engagements",
    label: "Engagements",
    format: formatCompact,
    extract: (m) => m.engagements,
    extractWeekly: (w) => w.engagements,
  },
  {
    key: "engagement_rate",
    label: "Engagement Rate",
    format: (v) => formatPercent(v),
    extract: (m) => m.engagement_rate,
    extractWeekly: (w) => (w.impressions > 0 ? (w.engagements / w.impressions) * 100 : 0),
  },
  {
    key: "video_views",
    label: "Video Views",
    format: formatCompact,
    extract: (m) => m.video_views,
  },
  {
    key: "follower_growth",
    label: "Follower Growth",
    format: (v) => `${v >= 0 ? "+" : ""}${formatCompact(v)}`,
    extract: (m) => m.net_follower_growth,
    extractWeekly: (w) => w.net_follower_growth,
    showSign: true,
  },
];

interface SocialKpiBarProps {
  metrics: AggregateMetrics;
  weeklyTrends: WeeklySnapshot[];
  previousMetrics?: AggregateMetrics | null;
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const isUp = pct > 0;
  const Icon = pct === 0 ? Minus : isUp ? TrendingUp : TrendingDown;
  const color = isUp ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${color}`}>
      <Icon size={12} />
      {isUp ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

export function SocialKpiBar({ metrics, weeklyTrends, previousMetrics }: SocialKpiBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {KPI_DEFS.map((kpi) => {
        const value = kpi.extract(metrics);
        const prevValue = previousMetrics ? kpi.extract(previousMetrics) : null;
        const sparkData = kpi.extractWeekly ? weeklyTrends.map(kpi.extractWeekly) : [];

        return (
          <Card key={kpi.key} className="px-4 py-3">
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              {kpi.label}
            </div>
            <div className="flex items-baseline gap-2">
              <Value className="text-2xl">{kpi.format(value)}</Value>
              {prevValue !== null && <Delta current={value} previous={prevValue} />}
            </div>
            {sparkData.length >= 2 && (
              <div className="mt-1">
                <Sparkline data={sparkData} color="var(--color-primary)" width={80} height={20} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
