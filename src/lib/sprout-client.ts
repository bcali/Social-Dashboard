import type { SproutHealthResponse, SproutReportingRow } from "./social-types";

export async function checkHealth(
  proxyUrl: string,
  signal?: AbortSignal,
): Promise<SproutHealthResponse> {
  const res = await fetch(`${proxyUrl}/health`, { signal });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchReporting(
  proxyUrl: string,
  startDate: string,
  endDate: string,
  profileIds?: string[],
  signal?: AbortSignal,
): Promise<SproutReportingRow[]> {
  const body: Record<string, unknown> = { start_date: startDate, end_date: endDate };
  if (profileIds?.length) body.profile_ids = profileIds;

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

  return res.json();
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
  profileIds?: string[],
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
