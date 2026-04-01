import { useMemo } from "react";
import { useFetchJson } from "./useFetchJson";
import { useSproutLive } from "./useSproutLive";
import type { HotelEntry, AggregateMetrics, WeeklySnapshot, GlobalTop4Baseline } from "@/lib/social-types";

interface SproutFilters {
  region?: string | null;
  brand?: string | null;
  dateRange?: { start: string | null; end: string | null };
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
  const proxyUrl = import.meta.env.VITE_SPROUT_PROXY_URL as string | undefined;
  const dateRange = filters.dateRange ?? { start: null, end: null };

  // Live mode — no-ops internally when proxyUrl is falsy
  const live = useSproutLive(proxyUrl, dateRange);

  // Mock mode — always loaded as fallback
  const mock = useFetchJson<HotelEntry[]>("data/sprout-mock.json");

  // Source selection: live if available, else mock
  const isLive = Boolean(proxyUrl) && live.isLive && live.data !== null;
  const hotels = isLive ? live.data : mock.data;
  const loading = proxyUrl ? live.loading || mock.loading : mock.loading;
  const error = proxyUrl && live.error && !live.data ? live.error : mock.error;

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

  const top5WeeklyTrends = useMemo(() => {
    if (!filteredHotels.length) return [];
    const sorted = [...filteredHotels].sort((a, b) => b.metrics.engagement_rate - a.metrics.engagement_rate);
    return aggregateWeeklyTrends(sorted.slice(0, 5));
  }, [filteredHotels]);

  const perHotelTrends = useMemo(() => {
    const map = new Map<string, WeeklySnapshot[]>();
    for (const h of filteredHotels) {
      if (h.weekly_history.length > 0) {
        map.set(h.hotel_id, h.weekly_history);
      }
    }
    return map;
  }, [filteredHotels]);

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
    top5WeeklyTrends,
    perHotelTrends,
    globalTop4,
    availableRegions,
    availableBrands,
    loading,
    error,
    isLive,
  };
}
