import { useEffect, useRef, useState } from "react";
import { useFetchJson } from "./useFetchJson";
import type { HotelDirectoryEntry, HotelEntry } from "@/lib/social-types";
import { checkHealth, fetchReporting, fetchWeeklyBreakdown } from "@/lib/sprout-client";
import { transformToHotelEntries } from "@/lib/sprout-transform";

const NUM_WEEKS = 8;
const DEBOUNCE_MS = 600;

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
 * Date range changes are debounced by 600ms to avoid excessive API calls.
 */
export function useSproutLive(proxyUrl: string | undefined, dateRange: DateRange): SproutLiveResult {
  const [data, setData] = useState<HotelEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: directory } = useFetchJson<HotelDirectoryEntry[]>("data/hotels.json");

  useEffect(() => {
    if (!proxyUrl || !directory) {
      setIsLive(false);
      return;
    }

    // Clear any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const health = await checkHealth(proxyUrl!, signal);
        if (!health.ok || !health.has_token) {
          setIsLive(false);
          setError("Sprout proxy not ready (missing token)");
          setLoading(false);
          return;
        }

        const allProfileIds = directory!.flatMap((h) => h.profile_ids);

        const endDate = dateRange.end ?? new Date().toISOString().slice(0, 10);
        const startFallback = new Date(endDate);
        startFallback.setDate(startFallback.getDate() - NUM_WEEKS * 7);
        const startDate = dateRange.start ?? startFallback.toISOString().slice(0, 10);

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

    // Debounce date range changes, but load immediately on first mount
    if (data === null && !isLive) {
      load();
    } else {
      debounceRef.current = setTimeout(load, DEBOUNCE_MS);
    }

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [proxyUrl, directory, dateRange.start, dateRange.end]);

  return { data, loading, error, isLive };
}
