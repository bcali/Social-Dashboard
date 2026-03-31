import { useFetchJson } from "@/hooks/useFetchJson";
import type { KpiData, KpiSnapshot } from "@/lib/types";
import { getTrend } from "@/lib/kpi-utils";
import { KpiCard } from "./KpiCard";

export function KpiCards() {
  const { data: kpiData } = useFetchJson<KpiData>("data/kpis.json");

  if (!kpiData) return null;

  const latest = kpiData.history.length ? kpiData.history[kpiData.history.length - 1] : null;
  const headlineTargets = kpiData.targets.slice(0, 2);
  const secondaryTargets = kpiData.targets.slice(2);

  const visibleSecondary = secondaryTargets.filter((t) => {
    const v = latest?.metrics?.[t.key];
    return v !== undefined;
  });

  const getSparkline = (key: string): (number | null)[] =>
    kpiData.history.map((s: KpiSnapshot) => s.metrics[key] ?? null);

  return (
    <div className="space-y-1.5">
      {headlineTargets.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {headlineTargets.map((target) => (
            <KpiCard
              key={target.key}
              target={target}
              value={latest?.metrics?.[target.key] ?? null}
              trend={getTrend(kpiData.history, target.key)}
              isHeadline
              sparklineData={getSparkline(target.key)}
            />
          ))}
        </div>
      )}
      {visibleSecondary.length > 0 && (
        <div
          className={`grid gap-1.5 ${visibleSecondary.length <= 3 ? "grid-cols-3" : visibleSecondary.length <= 4 ? "grid-cols-4" : "grid-cols-5"}`}
        >
          {visibleSecondary.map((target) => (
            <KpiCard
              key={target.key}
              target={target}
              value={latest?.metrics?.[target.key] ?? null}
              trend={getTrend(kpiData.history, target.key)}
              isHeadline={false}
              sparklineData={getSparkline(target.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
