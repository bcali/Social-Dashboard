import { useEffect, useState } from "react";
import { useFetchJson } from "./useFetchJson";
import type { HotelDirectoryEntry, HotelEntry } from "@/lib/social-types";
import { checkHealth, fetchReporting, fetchWeeklyBreakdown } from "@/lib/sprout-client";
import { transformToHotelEntries } from "@/lib/sprout-transform";

const NUM_WEEKS = 8;

interface DateRange {
  start: string | null;
  end: string | null;
}

interface SproutLiveResult {
  data: HotelEntry[] | null;
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

/**
 * Fetches live data from the sprout-proxy worker and transforms it into HotelEntry[].
 * No-ops when proxyUrl is falsy (mock mode).
 *
 * Flow: health check → fetch profiles → fetch reporting (aggregate + weekly) → transform
 */
export function useSproutLive(proxyUrl: string | undefined, dateRange: DateRange): SproutLiveResult {
  const [data, setData] = useState<HotelEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const { data: directory } = useFetchJson<HotelDirectoryEntry[]>("data/hotels.json");

  useEffect(() => {
    if (!proxyUrl || !directory) {
      setIsLive(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Health check — bail to mock if proxy is down
        const health = await checkHealth(proxyUrl!, signal);
        if (!health.ok || !health.has_token) {
          setIsLive(false);
          setError("Sprout proxy not ready (missing token)");
          setLoading(false);
          return;
        }

        // Collect all profile IDs from the hotel directory
        const allProfileIds = directory!.flatMap((h) => h.profile_ids);

        // Compute date range — default to last 8 weeks from today
        const endDate = dateRange.end ?? new Date().toISOString().slice(0, 10);
        const startFallback = new Date(endDate);
        startFallback.setDate(startFallback.getDate() - NUM_WEEKS * 7);
        const startDate = dateRange.start ?? startFallback.toISOString().slice(0, 10);

        // Fetch aggregate + weekly breakdown in parallel
        const [aggregateRows, weeklyData] = await Promise.all([
          fetchReporting(proxyUrl!, startDate, endDate, allProfileIds, signal),
          fetchWeeklyBreakdown(proxyUrl!, NUM_WEEKS, endDate, allProfileIds, signal),
        ]);

        if (signal.aborted) return;

        const hotels = transformToHotelEntries(aggregateRows, weeklyData, directory!);
        setData(hotels);
        setIsLive(true);
      } catch (err) {
        if (signal.aborted) return;
        setIsLive(false);
        setError(err instanceof Error ? err.message : "Failed to fetch live data");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [proxyUrl, directory, dateRange.start, dateRange.end]);

  return { data, loading, error, isLive };
}
