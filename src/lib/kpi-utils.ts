import type { KpiMetrics, KpiTarget } from "./types";

export type StatusZone = "exceeding" | "meeting" | "below" | "unknown";

export function getStatusZone(target: KpiTarget, value: number | null): StatusZone {
  if (value === null) return "unknown";
  const floor = target.floor ?? target.target;
  const exceed = target.target;
  if (floor === null || exceed === null) return "unknown";

  if (target.direction === "above") {
    if (value >= exceed) return "exceeding";
    if (value >= floor) return "meeting";
    return "below";
  }
  if (value <= exceed) return "exceeding";
  if (value <= floor) return "meeting";
  return "below";
}

export type Trend = "up" | "down" | "flat" | null;

export function getTrend(history: { metrics: KpiMetrics }[], key: string): Trend {
  if (history.length < 2) return null;
  const recent = history.slice(-2);
  const prev = recent[0].metrics[key];
  const curr = recent[1].metrics[key];
  if (prev === null || prev === undefined || curr === null || curr === undefined) return null;
  if (curr > prev) return "up";
  if (curr < prev) return "down";
  return "flat";
}

export function formatValue(value: number | null, unit: string): string {
  if (value === null) return "\u2014";
  if (unit === "$") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }
  return `${value}${unit}`;
}

export function getDelta(
  value: number | null,
  baseline: number | null | undefined,
  direction: "above" | "below",
): { label: string; isGood: boolean } | null {
  if (value === null || baseline == null) return null;
  const diff = value - baseline;
  if (diff === 0) return { label: "At baseline", isGood: true };
  const absDiff = Math.abs(diff);
  const sign = diff > 0 ? "+" : "-";
  const isGood = (diff > 0 && direction === "above") || (diff < 0 && direction === "below");
  return { label: `${sign}${absDiff.toFixed(1)} vs baseline`, isGood };
}
