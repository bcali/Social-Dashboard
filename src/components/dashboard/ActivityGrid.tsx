import { Card, Value } from "@/components/ui";
import { formatCompact, formatPercent } from "@/lib/format";
import type { AggregateMetrics, WeeklySnapshot } from "@/lib/social-types";

interface ActivityGridProps {
  metrics: AggregateMetrics;
  weeklyTrends: WeeklySnapshot[];
}

function postingConsistency(weeklyTrends: WeeklySnapshot[]): string {
  if (weeklyTrends.length < 2) return "—";
  // Use engagements as a proxy for activity variance
  const counts = weeklyTrends.map((w) => w.engagements);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((a, v) => a + (v - mean) ** 2, 0) / counts.length;
  const cv = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0;
  if (cv < 10) return "High";
  if (cv < 25) return "Medium";
  return "Low";
}

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <Card className="px-4 py-3">
      <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
      <Value className="text-xl">{value}</Value>
      {sublabel && <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{sublabel}</div>}
    </Card>
  );
}

export function ActivityGrid({ metrics, weeklyTrends }: ActivityGridProps) {
  const avgEngPerPost = metrics.messages_sent > 0 ? metrics.engagements / metrics.messages_sent : 0;

  // Video split is not available in current mock data, show placeholder
  const videoSplit = metrics.video_views > 0 ? Math.min((metrics.video_views / metrics.impressions) * 100, 100) : 0;

  const consistency = postingConsistency(weeklyTrends);

  return (
    <div>
      <h3
        className="text-sm font-semibold text-[var(--text-primary)] mb-3"
        style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
      >
        Activity & Discipline
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Posts Published" value={formatCompact(metrics.messages_sent)} sublabel="Total in period" />
        <StatCard label="Avg Engagement / Post" value={formatCompact(avgEngPerPost)} sublabel="Engagements ÷ posts" />
        <StatCard label="Video Share" value={formatPercent(videoSplit)} sublabel="Video views vs impressions" />
        <StatCard label="Posting Consistency" value={consistency} sublabel="Activity variance" />
      </div>
    </div>
  );
}
