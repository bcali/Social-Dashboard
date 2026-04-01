import { useState, useMemo, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Search, X } from "lucide-react";
import { Card, Badge, Input } from "@/components/ui";
import type { HotelEntry, WeeklySnapshot } from "@/lib/social-types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

type MetricKey = "engagement_rate" | "impressions" | "follower_growth";

interface TrendChartProps {
  weeklyTrends: WeeklySnapshot[];
  top5WeeklyTrends: WeeklySnapshot[];
  hotels: HotelEntry[];
  perHotelTrends: Map<string, WeeklySnapshot[]>;
}

const METRIC_OPTIONS: { key: MetricKey; label: string }[] = [
  { key: "engagement_rate", label: "Engagement Rate" },
  { key: "impressions", label: "Impressions" },
  { key: "follower_growth", label: "Follower Growth" },
];

const LINE_COLORS = ["#e67e22", "#9b59b6", "#1abc9c", "#e74c3c", "#f39c12", "#3498db", "#2ecc71", "#e84393"];

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

function avgMetric(trends: WeeklySnapshot[], key: MetricKey, count: number): number[] {
  return trends.map((w) => {
    if (key === "engagement_rate") {
      return w.impressions > 0 ? (w.engagements / w.impressions) * 100 : 0;
    }
    return extractMetric(w, key) / Math.max(count, 1);
  });
}

export function TrendChart({ weeklyTrends, top5WeeklyTrends, hotels, perHotelTrends }: TrendChartProps) {
  const [metric, setMetric] = useState<MetricKey>("engagement_rate");
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    if (pickerOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  const labels = weeklyTrends.map((w) => w.period);
  const hotelCount = hotels.length;

  const style = getComputedStyle(document.documentElement);
  const primaryColor = style.getPropertyValue("--color-primary").trim() || "#0d4877";
  const secondaryColor = style.getPropertyValue("--color-secondary").trim() || "#2c7a7b";

  // Build datasets
  const datasets = useMemo(() => {
    const ds: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
      borderDash?: number[];
      borderWidth?: number;
    }> = [];

    // Line 1: All Hotels Avg
    ds.push({
      label: "All Hotels Avg",
      data: avgMetric(weeklyTrends, metric, metric === "engagement_rate" ? 1 : hotelCount),
      borderColor: primaryColor,
      backgroundColor: "transparent",
      fill: false,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
    });

    // Line 2: Top 5 Avg
    if (top5WeeklyTrends.length > 0) {
      ds.push({
        label: "Top 5 Avg",
        data: avgMetric(top5WeeklyTrends, metric, metric === "engagement_rate" ? 1 : 5),
        borderColor: secondaryColor,
        backgroundColor: "transparent",
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [6, 3],
        borderWidth: 2,
      });
    }

    // Selected hotel lines
    for (let i = 0; i < selectedHotels.length; i++) {
      const hotelId = selectedHotels[i];
      const hotel = hotels.find((h) => h.hotel_id === hotelId);
      const trends = perHotelTrends.get(hotelId);
      if (!hotel || !trends) continue;

      const color = LINE_COLORS[i % LINE_COLORS.length];
      ds.push({
        label: hotel.name,
        data: trends.map((w) => extractMetric(w, metric)),
        borderColor: color,
        backgroundColor: "transparent",
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 1.5,
      });
    }

    return ds;
  }, [
    weeklyTrends,
    top5WeeklyTrends,
    selectedHotels,
    hotels,
    perHotelTrends,
    metric,
    hotelCount,
    primaryColor,
    secondaryColor,
  ]);

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" as const, labels: { boxWidth: 12, font: { size: 10 } } },
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

  const filteredHotels = useMemo(() => {
    if (!pickerSearch) return hotels.slice(0, 50);
    const q = pickerSearch.toLowerCase();
    return hotels.filter((h) => h.name.toLowerCase().includes(q)).slice(0, 50);
  }, [hotels, pickerSearch]);

  const toggleHotel = (hotelId: string) => {
    setSelectedHotels((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : prev.length < 5 ? [...prev, hotelId] : prev,
    );
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

      {/* Hotel picker */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className="px-2 py-1 text-[11px] rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            + Compare Hotel
          </button>
          {pickerOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 ui-card p-2 w-72 shadow-lg">
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search hotels..."
                  size="sm"
                  className="pl-6 text-[11px]"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredHotels.map((h) => {
                  const isSelected = selectedHotels.includes(h.hotel_id);
                  return (
                    <button
                      key={h.hotel_id}
                      type="button"
                      onClick={() => toggleHotel(h.hotel_id)}
                      className={`w-full text-left px-2 py-1.5 text-[11px] rounded cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[var(--color-primary-dim)] text-[var(--color-primary)]"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      }`}
                    >
                      {h.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected hotel chips */}
        {selectedHotels.map((id, i) => {
          const hotel = hotels.find((h) => h.hotel_id === id);
          if (!hotel) return null;
          return (
            <Badge
              key={id}
              color="secondary"
              className="text-[10px] flex items-center gap-1"
              style={{ borderLeftColor: LINE_COLORS[i % LINE_COLORS.length], borderLeftWidth: 3 }}
            >
              {hotel.name}
              <button
                type="button"
                onClick={() => toggleHotel(id)}
                className="ml-1 hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={10} />
              </button>
            </Badge>
          );
        })}
      </div>

      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </Card>
  );
}
