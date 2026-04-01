import type {
  SproutHealthResponse,
  SproutReportingRow,
  SproutAnalyticsResponse,
  SproutApiProfile,
} from "./social-types";

export async function checkHealth(proxyUrl: string, signal?: AbortSignal): Promise<SproutHealthResponse> {
  const res = await fetch(`${proxyUrl}/health`, { signal });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchProfiles(proxyUrl: string, signal?: AbortSignal): Promise<SproutApiProfile[]> {
  const res = await fetch(`${proxyUrl}/profiles`, { signal });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Profiles API error ${res.status}: ${detail}`);
  }
  const json = (await res.json()) as { data: SproutApiProfile[] };
  return json.data;
}

/**
 * Fetches reporting data and normalizes Sprout's daily per-profile rows
 * into aggregated SproutReportingRow[] (one row per profile, summed across days).
 */
export async function fetchReporting(
  proxyUrl: string,
  startDate: string,
  endDate: string,
  profileIds: string[],
  signal?: AbortSignal,
): Promise<SproutReportingRow[]> {
  const body = { start_date: startDate, end_date: endDate, profile_ids: profileIds };

  const res = await fetch(`${proxyUrl}/reporting`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Reporting API error ${res.status}: ${detail}`);
  }

  const json = (await res.json()) as SproutAnalyticsResponse;
  return normalizeDailyRows(json.data);
}

/**
 * Aggregates daily Sprout rows into one SproutReportingRow per profile.
 * Sums all metric fields across days for each customer_profile_id.
 */
function normalizeDailyRows(raw: SproutAnalyticsResponse["data"]): SproutReportingRow[] {
  const byProfile = new Map<
    number,
    { impressions: number; engagements: number; net_follower_growth: number; video_views: number }
  >();

  for (const row of raw) {
    const pid = row.dimensions.customer_profile_id;
    const existing = byProfile.get(pid);
    if (existing) {
      existing.impressions += row.metrics.impressions;
      existing.engagements += row.metrics.engagements;
      existing.net_follower_growth += row.metrics.net_follower_growth;
      existing.video_views += row.metrics.video_views;
    } else {
      byProfile.set(pid, {
        impressions: row.metrics.impressions,
        engagements: row.metrics.engagements,
        net_follower_growth: row.metrics.net_follower_growth,
        video_views: row.metrics.video_views,
      });
    }
  }

  const results: SproutReportingRow[] = [];
  for (const [pid, m] of byProfile) {
    results.push({
      profile_id: String(pid),
      impressions: m.impressions,
      engagements: m.engagements,
      engagement_rate_by_impressions_percentage: m.impressions > 0 ? (m.engagements / m.impressions) * 100 : 0,
      net_follower_growth: m.net_follower_growth,
      video_views: m.video_views,
      messages_sent: 0, // Not available in analytics endpoint
    });
  }

  return results;
}

/** Computes Monday-to-Sunday week boundaries going backward from endDate. */
function getWeekBoundaries(numWeeks: number, endDate: string): { period: string; start: string; end: string }[] {
  const anchor = new Date(endDate);
  // Roll back to the most recent Sunday (end of last complete week)
  const day = anchor.getDay();
  const lastSunday = new Date(anchor);
  lastSunday.setDate(anchor.getDate() - (day === 0 ? 0 : day));

  const weeks: { period: string; start: string; end: string }[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekEnd = new Date(lastSunday);
    weekEnd.setDate(lastSunday.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    weeks.push({
      period: `W${String(numWeeks - i).padStart(2, "0")}`,
      start: weekStart.toISOString().slice(0, 10),
      end: weekEnd.toISOString().slice(0, 10),
    });
  }

  return weeks;
}

export interface WeeklyReportingResult {
  period: string;
  date: string;
  rows: SproutReportingRow[];
}

export async function fetchWeeklyBreakdown(
  proxyUrl: string,
  numWeeks: number,
  endDate: string,
  profileIds: string[],
  signal?: AbortSignal,
): Promise<WeeklyReportingResult[]> {
  const weeks = getWeekBoundaries(numWeeks, endDate);

  const results = await Promise.all(
    weeks.map(async (week) => {
      const rows = await fetchReporting(proxyUrl, week.start, week.end, profileIds, signal);
      return { period: week.period, date: week.start, rows };
    }),
  );

  return results;
}
