import type { HotelDirectoryEntry, HotelEntry, HotelMetrics, SproutReportingRow, WeeklySnapshot } from "./social-types";
import type { WeeklyReportingResult } from "./sprout-client";

/**
 * Transforms raw Sprout API reporting data into HotelEntry[] using the hotel directory.
 * Groups per-profile rows by hotel, sums metrics, and builds weekly history.
 */
export function transformToHotelEntries(
  aggregateRows: SproutReportingRow[],
  weeklyData: WeeklyReportingResult[],
  directory: HotelDirectoryEntry[],
): HotelEntry[] {
  const profileToHotel = buildProfileLookup(directory);

  // Group aggregate rows by hotel
  const hotelAggregates = groupByHotel(aggregateRows, profileToHotel);

  // Group weekly rows by hotel per period
  const hotelWeekly = new Map<string, WeeklySnapshot[]>();
  for (const week of weeklyData) {
    const grouped = groupByHotel(week.rows, profileToHotel);
    for (const [hotelId, rows] of grouped) {
      const metrics = sumMetrics(rows);
      const snapshot: WeeklySnapshot = {
        period: week.period,
        date: week.date,
        impressions: metrics.impressions,
        engagements: metrics.engagements,
        net_follower_growth: metrics.net_follower_growth,
      };
      const existing = hotelWeekly.get(hotelId);
      if (existing) {
        existing.push(snapshot);
      } else {
        hotelWeekly.set(hotelId, [snapshot]);
      }
    }
  }

  // Assemble HotelEntry for each directory entry that has data
  const entries: HotelEntry[] = [];
  for (const hotel of directory) {
    const rows = hotelAggregates.get(hotel.hotel_id);
    if (!rows || rows.length === 0) continue;

    const metrics = sumMetrics(rows);
    const weekly = hotelWeekly.get(hotel.hotel_id) ?? [];
    weekly.sort((a, b) => a.period.localeCompare(b.period));

    entries.push({
      hotel_id: hotel.hotel_id,
      name: hotel.name,
      brand: hotel.brand,
      region: hotel.region,
      country: hotel.country,
      sprout_profiles: hotel.profile_ids.map((id) => ({
        profile_id: id,
        channel: hotel.channels[id] ?? "facebook",
      })),
      metrics,
      weekly_history: weekly,
    });
  }

  return entries;
}

/** Builds a map from profile_id → hotel_id using the directory. */
function buildProfileLookup(directory: HotelDirectoryEntry[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const hotel of directory) {
    for (const profileId of hotel.profile_ids) {
      lookup.set(profileId, hotel.hotel_id);
    }
  }
  return lookup;
}

/** Groups reporting rows by hotel_id. Unmapped profiles are skipped with a warning. */
function groupByHotel(
  rows: SproutReportingRow[],
  profileToHotel: Map<string, string>,
): Map<string, SproutReportingRow[]> {
  const groups = new Map<string, SproutReportingRow[]>();
  for (const row of rows) {
    const hotelId = profileToHotel.get(row.profile_id);
    if (!hotelId) {
      console.warn(`[sprout-transform] Unmapped profile_id: ${row.profile_id}`);
      continue;
    }
    const existing = groups.get(hotelId);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(hotelId, [row]);
    }
  }
  return groups;
}

/** Sums metrics across multiple profile rows for a single hotel. */
function sumMetrics(rows: SproutReportingRow[]): HotelMetrics {
  let impressions = 0;
  let engagements = 0;
  let video_views = 0;
  let net_follower_growth = 0;
  let messages_sent = 0;

  for (const r of rows) {
    impressions += r.impressions;
    engagements += r.engagements;
    video_views += r.video_views;
    net_follower_growth += r.net_follower_growth;
    messages_sent += r.messages_sent;
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
