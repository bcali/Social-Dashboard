import { AlertTriangle, CheckCircle, Minus, Star, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, Card, Sparkline, Value } from "@/components/ui";
import type { KpiTarget } from "@/lib/types";
import type { StatusZone, Trend } from "@/lib/kpi-utils";
import { formatValue, getDelta, getStatusZone } from "@/lib/kpi-utils";

type GlowVariant = "none" | "success" | "primary" | "danger";
type ColorVariant = "success" | "primary" | "danger" | "warning";

const ZONE_STYLES: Record<
  StatusZone,
  { glow: GlowVariant; color: ColorVariant; badgeLabel: string; icon: typeof Star }
> = {
  exceeding: { glow: "success", color: "success", badgeLabel: "Exceeding", icon: Star },
  meeting: { glow: "primary", color: "primary", badgeLabel: "On Track", icon: CheckCircle },
  below: { glow: "danger", color: "danger", badgeLabel: "Below Floor", icon: AlertTriangle },
  unknown: { glow: "none", color: "warning", badgeLabel: "No Data", icon: Minus },
};

const SPARKLINE_COLORS: Record<string, string> = {
  success: "var(--color-success)",
  primary: "var(--color-primary)",
  danger: "var(--color-danger)",
  warning: "var(--color-warning)",
};

function TrendIcon({ trend, direction }: { trend: Trend; direction: "above" | "below" }) {
  if (trend === null) return null;
  if (trend === "flat") return <Minus size={14} className="text-[var(--text-muted)]" />;

  const isGood = (trend === "up" && direction === "above") || (trend === "down" && direction === "below");
  const color = isGood ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
  if (trend === "up") return <TrendingUp size={14} className={color} />;
  return <TrendingDown size={14} className={color} />;
}

interface KpiCardProps {
  target: KpiTarget;
  value: number | null;
  trend: Trend;
  isHeadline: boolean;
  sparklineData: (number | null)[];
}

export function KpiCard({ target, value, trend, isHeadline, sparklineData }: KpiCardProps) {
  const zone = getStatusZone(target, value);
  const style = ZONE_STYLES[zone];
  const Icon = style.icon;
  const hasFloor = target.floor != null;
  const delta = getDelta(value, target.baseline, target.direction);

  return (
    <Card glow={style.glow} className={isHeadline ? "px-4 py-2.5" : "px-3 py-2"}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider truncate">
          {target.name}
        </span>
        <div className="flex items-center gap-1">
          <TrendIcon trend={trend} direction={target.direction} />
          <Badge color={style.color} className="gap-0.5">
            <Icon size={9} />
            {style.badgeLabel}
          </Badge>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <Value color={style.color} className={isHeadline ? "text-2xl" : "text-xl"}>
          {formatValue(value, target.unit)}
        </Value>
        {delta && (
          <span
            className={`text-[10px] font-semibold ${delta.isGood ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
          >
            {delta.label}
          </span>
        )}
        <Sparkline
          data={sparklineData}
          color={SPARKLINE_COLORS[style.color] ?? "var(--text-muted)"}
          width={isHeadline ? 64 : 48}
          height={isHeadline ? 18 : 16}
        />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0 text-[11px] text-[var(--text-muted)] font-mono">
        {target.baseline != null && (
          <span>
            Base: {target.baseline}
            {target.unit}
          </span>
        )}
        {hasFloor && (
          <span>
            Floor: {target.direction === "above" ? "\u2265" : "\u2264"}
            {target.floor}
            {target.unit}
          </span>
        )}
        {target.target !== null && (
          <span>
            Exceed: {target.direction === "above" ? "\u2265" : "\u2264"}
            {target.target}
            {target.unit}
          </span>
        )}
      </div>
    </Card>
  );
}
