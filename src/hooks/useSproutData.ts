import { useMemo } from "react";
import { useFetchJson } from "./useFetchJson";
import type { HotelEntry, AggregateMetrics, WeeklySnapshot, GlobalTop4Baseline } from "@/lib/social-types";

interface SproutFilters {
  region?: string | null;
  brand?: string | null;
}

function aggregateHotels(hotels: HotelEntry[]): AggregateMetrics {
  let impressions = 0;
  let engagements = 0;
  let video_views = 0;
  let net_follower_growth = 0;
  let messages_sent = 0;

  for (const h of hotels) {
    impressions += h.metrics.impressions;
    engagements += h.metrics.engagements;
    video_views += h.metrics.video_views;
    net_follower_growth += h.metrics.net_follower_growth;
    messages_sent += h.metrics.messages_sent;
  }

  return {
    impressions,
    engagements,
    engagement_rate: impressions > 0 ? (engagements / impressions) * 100 : 0,
    video_views,
    net_follower_growth,
    messages_sent,
  };
}

function computeGlobalTop4(hotels: HotelEntry[]): GlobalTop4Baseline {
  const sorted = [...hotels].sort((a, b) => b.metrics.engagement_rate - a.metrics.engagement_rate);
  const top4 = sorted.slice(0, 4);

  if (top4.length === 0) {
    return { engagement_rate: 0, impressions: 0, follower_growth: 0, hotels: [] };
  }

  const totalImpressions = top4.reduce((s, h) => s + h.metrics.impressions, 0);
  const totalEngagements = top4.reduce((s, h) => s + h.metrics.engagements, 0);

  return {
    engagement_rate: totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0,
    impressions: totalImpressions / top4.length,
    follower_growth: top4.reduce((s, h) => s + h.metrics.net_follower_growth, 0) / top4.length,
    hotels: top4.map((h) => h.name),
  };
}

function aggregateWeeklyTrends(hotels: HotelEntry[]): WeeklySnapshot[] {
  const weekMap = new Map<
    string,
    { impressions: number; engagements: number; net_follower_growth: number; date: string }
  >();

  for (const h of hotels) {
    for (const w of h.weekly_history) {
      const existing = weekMap.get(w.period);
      if (existing) {
        existing.impressions += w.impressions;
        existing.engagements += w.engagements;
        existing.net_follower_growth += w.net_follower_growth;
      } else {
        weekMap.set(w.period, {
          impressions: w.impressions,
          engagements: w.engagements,
          net_follower_growth: w.net_follower_growth,
          date: w.date,
        });
      }
    }
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      date: data.date,
      impressions: data.impressions,
      engagements: data.engagements,
      net_follower_growth: data.net_follower_growth,
    }));
}

export function useSproutData(filters: SproutFilters = {}) {
  const { data: hotels, loading, error } = useFetchJson<HotelEntry[]>("data/sprout-mock.json");

  const filteredHotels = useMemo(() => {
    if (!hotels) return [];
    let result = hotels;

    if (filters.region) {
      result = result.filter((h) => h.region === filters.region);
    }
    if (filters.brand) {
      result = result.filter((h) => h.brand === filters.brand);
    }

    return result;
  }, [hotels, filters.region, filters.brand]);

  const aggregateMetrics = useMemo(() => aggregateHotels(filteredHotels), [filteredHotels]);

  const weeklyTrends = useMemo(() => aggregateWeeklyTrends(filteredHotels), [filteredHotels]);

  const globalTop4 = useMemo(() => (hotels ? computeGlobalTop4(hotels) : null), [hotels]);

  const availableRegions = useMemo(() => {
    if (!hotels) return [];
    return [...new Set(hotels.map((h) => h.region))].sort();
  }, [hotels]);

  const availableBrands = useMemo(() => {
    if (!hotels) return [];
    return [...new Set(hotels.map((h) => h.brand))].sort();
  }, [hotels]);

  return {
    hotels: hotels ?? [],
    filteredHotels,
    aggregateMetrics,
    weeklyTrends,
    globalTop4,
    availableRegions,
    availableBrands,
    loading,
    error,
  };
}
