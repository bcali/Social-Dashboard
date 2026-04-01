import { describe, it, expect } from "vitest";
import { transformToHotelEntries } from "@/lib/sprout-transform";
import type { HotelDirectoryEntry, SproutReportingRow } from "@/lib/social-types";
import type { WeeklyReportingResult } from "@/lib/sprout-client";

function makeRow(overrides: Partial<SproutReportingRow> = {}): SproutReportingRow {
  return {
    profile_id: "p1",
    impressions: 1000,
    engagements: 50,
    engagement_rate_by_impressions_percentage: 5,
    net_follower_growth: 10,
    video_views: 200,
    messages_sent: 5,
    ...overrides,
  };
}

function makeDirectory(overrides: Partial<HotelDirectoryEntry> = {}): HotelDirectoryEntry {
  return {
    hotel_id: "h1",
    name: "Test Hotel",
    brand: "AN",
    region: "AMEA",
    country: "TH",
    profile_ids: ["p1"],
    channels: { p1: "facebook" },
    ...overrides,
  };
}

describe("transformToHotelEntries", () => {
  it("transforms a single hotel with a single profile", () => {
    const rows = [makeRow()];
    const directory = [makeDirectory()];
    const result = transformToHotelEntries(rows, [], directory);

    expect(result).toHaveLength(1);
    expect(result[0].hotel_id).toBe("h1");
    expect(result[0].name).toBe("Test Hotel");
    expect(result[0].metrics.impressions).toBe(1000);
    expect(result[0].metrics.engagements).toBe(50);
    expect(result[0].metrics.engagement_rate).toBe(5); // (50/1000)*100
  });

  it("sums metrics across multiple profiles for one hotel", () => {
    const rows = [
      makeRow({ profile_id: "p1", impressions: 1000, engagements: 50, video_views: 100, net_follower_growth: 10, messages_sent: 3 }),
      makeRow({ profile_id: "p2", impressions: 2000, engagements: 100, video_views: 300, net_follower_growth: 20, messages_sent: 7 }),
    ];
    const directory = [
      makeDirectory({ profile_ids: ["p1", "p2"], channels: { p1: "facebook", p2: "instagram" } }),
    ];
    const result = transformToHotelEntries(rows, [], directory);

    expect(result).toHaveLength(1);
    expect(result[0].metrics.impressions).toBe(3000);
    expect(result[0].metrics.engagements).toBe(150);
    // Weighted engagement rate: (150/3000)*100 = 5
    expect(result[0].metrics.engagement_rate).toBe(5);
    expect(result[0].metrics.video_views).toBe(400);
    expect(result[0].metrics.net_follower_growth).toBe(30);
    expect(result[0].metrics.messages_sent).toBe(10);
  });

  it("skips unmapped profiles", () => {
    const rows = [
      makeRow({ profile_id: "p1" }),
      makeRow({ profile_id: "unknown_profile" }),
    ];
    const directory = [makeDirectory()];
    const result = transformToHotelEntries(rows, [], directory);

    expect(result).toHaveLength(1);
    expect(result[0].metrics.impressions).toBe(1000); // only p1
  });

  it("returns empty array for empty inputs", () => {
    expect(transformToHotelEntries([], [], [])).toEqual([]);
  });

  it("handles zero impressions without dividing by zero", () => {
    const rows = [makeRow({ impressions: 0, engagements: 0 })];
    const directory = [makeDirectory()];
    const result = transformToHotelEntries(rows, [], directory);

    expect(result[0].metrics.engagement_rate).toBe(0);
  });

  it("builds weekly history from weekly breakdown data", () => {
    const weeklyData: WeeklyReportingResult[] = [
      { period: "W01", date: "2026-01-05", rows: [makeRow({ profile_id: "p1", impressions: 500, engagements: 25, net_follower_growth: 5 })] },
      { period: "W02", date: "2026-01-12", rows: [makeRow({ profile_id: "p1", impressions: 600, engagements: 30, net_follower_growth: 7 })] },
    ];
    const directory = [makeDirectory()];
    const result = transformToHotelEntries([makeRow()], weeklyData, directory);

    expect(result[0].weekly_history).toHaveLength(2);
    expect(result[0].weekly_history[0]).toEqual({
      period: "W01",
      date: "2026-01-05",
      impressions: 500,
      engagements: 25,
      net_follower_growth: 5,
    });
    expect(result[0].weekly_history[1].period).toBe("W02");
  });

  it("skips directory entries with no matching reporting data", () => {
    const rows = [makeRow({ profile_id: "p1" })];
    const directory = [
      makeDirectory({ hotel_id: "h1", profile_ids: ["p1"], channels: { p1: "facebook" } }),
      makeDirectory({ hotel_id: "h2", name: "Empty Hotel", profile_ids: ["p99"], channels: { p99: "instagram" } }),
    ];
    const result = transformToHotelEntries(rows, [], directory);

    expect(result).toHaveLength(1);
    expect(result[0].hotel_id).toBe("h1");
  });
});
