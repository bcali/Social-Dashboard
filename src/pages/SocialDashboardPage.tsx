import { useState } from "react";
import { ErrorBoundary, Badge } from "@/components/ui";
import { SocialKpiBar } from "@/components/dashboard/SocialKpiBar";
import { SocialFilterBar } from "@/components/dashboard/SocialFilterBar";
import { PropertyRankingTable } from "@/components/dashboard/PropertyRankingTable";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { ActivityGrid } from "@/components/dashboard/ActivityGrid";
import { TopPostsTable } from "@/components/dashboard/TopPostsTable";
import { InsightSummary } from "@/components/dashboard/InsightSummary";
import { useSproutData } from "@/hooks/useSproutData";

export function SocialDashboardPage() {
  const [region, setRegion] = useState("all");
  const [brand, setBrand] = useState("all");
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [appliedRegion, setAppliedRegion] = useState("all");
  const [appliedBrand, setAppliedBrand] = useState("all");

  const {
    filteredHotels,
    aggregateMetrics,
    weeklyTrends,
    top5WeeklyTrends,
    perHotelTrends,
    globalTop4,
    availableRegions,
    availableBrands,
    loading,
    isLive,
  } = useSproutData({
    region: appliedRegion === "all" ? null : appliedRegion,
    brand: appliedBrand === "all" ? null : appliedBrand,
    dateRange,
  });

  const hasPendingChanges = region !== appliedRegion || brand !== appliedBrand;
  const hasFilters = appliedRegion !== "all" || appliedBrand !== "all";

  const handleApply = () => {
    setAppliedRegion(region);
    setAppliedBrand(brand);
  };

  const handleReset = () => {
    setRegion("all");
    setBrand("all");
    setAppliedRegion("all");
    setAppliedBrand("all");
    setDateRange({ start: null, end: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">Loading dashboard data...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Badge color={isLive ? "success" : "secondary"}>{isLive ? "Live" : "Mock Data"}</Badge>
      </div>

      <ErrorBoundary name="Filters">
        <SocialFilterBar
          pendingDateRange={dateRange}
          onDateRangeChange={setDateRange}
          region={region}
          onRegionChange={setRegion}
          availableRegions={availableRegions}
          brand={brand}
          onBrandChange={setBrand}
          availableBrands={availableBrands}
          hasPendingChanges={hasPendingChanges}
          hasFilters={hasFilters}
          onApply={handleApply}
          onReset={handleReset}
        />
      </ErrorBoundary>

      <ErrorBoundary name="KPI Scorecard">
        <SocialKpiBar metrics={aggregateMetrics} weeklyTrends={weeklyTrends} />
      </ErrorBoundary>

      <ErrorBoundary name="Trend Chart">
        <TrendChart
          weeklyTrends={weeklyTrends}
          top5WeeklyTrends={top5WeeklyTrends}
          hotels={filteredHotels}
          perHotelTrends={perHotelTrends}
        />
      </ErrorBoundary>

      <ErrorBoundary name="Rankings">
        <PropertyRankingTable hotels={filteredHotels} baseline={globalTop4} />
      </ErrorBoundary>

      <ErrorBoundary name="Activity">
        <ActivityGrid metrics={aggregateMetrics} weeklyTrends={weeklyTrends} />
      </ErrorBoundary>

      <ErrorBoundary name="Top Content">
        <TopPostsTable />
      </ErrorBoundary>

      <ErrorBoundary name="Insights">
        <InsightSummary />
      </ErrorBoundary>
    </div>
  );
}
