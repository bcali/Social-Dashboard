import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from "chart.js";
import { Card } from "@/components/ui";
import type { WeeklySnapshot } from "@/lib/social-types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type MetricKey = "engagement_rate" | "impressions" | "follower_growth";

interface TrendChartProps {
  weeklyTrends: WeeklySnapshot[];
}

const METRIC_OPTIONS: { key: MetricKey; label: string }[] = [
  { key: "engagement_rate", label: "Engagement Rate" },
  { key: "impressions", label: "Impressions" },
  { key: "follower_growth", label: "Follower Growth" },
];

function extractMetric(w: WeeklySnapshot, key: MetricKey): number {
  switch (key) {
    case "engagement_rate":
      return w.impressions > 0 ? (w.engagements / w.impressions) * 100 : 0;
    case "impressions":
      return w.impressions;
    case "follower_growth":
      return w.net_follower_growth;
  }
}

export function TrendChart({ weeklyTrends }: TrendChartProps) {
  const [metric, setMetric] = useState<MetricKey>("engagement_rate");

  const labels = weeklyTrends.map((w) => w.period);
  const values = weeklyTrends.map((w) => extractMetric(w, metric));

  // Read CSS variables at render time
  const style = getComputedStyle(document.documentElement);
  const primaryColor = style.getPropertyValue("--color-primary").trim() || "#0d4877";
  const primaryDim = style.getPropertyValue("--color-primary-dim").trim() || "rgba(13,72,119,0.1)";

  const data = {
    labels,
    datasets: [
      {
        label: METRIC_OPTIONS.find((o) => o.key === metric)?.label ?? "",
        data: values,
        borderColor: primaryColor,
        backgroundColor: primaryDim,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
        >
          Performance Trends
        </h3>
        <div className="flex items-center gap-1">
          {METRIC_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setMetric(opt.key)}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                metric === opt.key
                  ? "bg-[var(--color-primary-dim)] border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </Card>
  );
}
