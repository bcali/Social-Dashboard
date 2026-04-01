export interface SproutProfile {
  profile_id: string;
  channel: "facebook" | "instagram" | "tiktok";
}

export interface HotelMetrics {
  impressions: number;
  engagements: number;
  engagement_rate: number;
  net_follower_growth: number;
  video_views: number;
  messages_sent: number;
}

export interface WeeklySnapshot {
  period: string;
  date: string;
  impressions: number;
  engagements: number;
  net_follower_growth: number;
}

export interface HotelEntry {
  hotel_id: string;
  name: string;
  brand: string;
  region: string;
  country: string;
  sprout_profiles: SproutProfile[];
  metrics: HotelMetrics;
  weekly_history: WeeklySnapshot[];
}

export interface AggregateMetrics {
  impressions: number;
  engagements: number;
  engagement_rate: number;
  net_follower_growth: number;
  video_views: number;
  messages_sent: number;
}

export interface SocialTargets {
  engagement_rate: { good: number; warning: number };
  follower_growth_pct: { good: number; warning: number };
  impressions_wow_growth: { good: number; warning: number };
}

export type ViewLevel = "global" | "region" | "hotel";

export interface GlobalTop4Baseline {
  engagement_rate: number;
  impressions: number;
  follower_growth: number;
  hotels: string[];
}

/* ── Sprout API / Live-mode types ── */

/** Maps Sprout profile IDs to hotel metadata. Loaded from data/hotels.json. */
export interface HotelDirectoryEntry {
  hotel_id: string;
  name: string;
  brand: string;
  region: string;
  country: string;
  profile_ids: string[];
  /** Maps each profile_id to its channel type */
  channels: Record<string, "facebook" | "instagram" | "tiktok">;
}

/** A single row from the Sprout /reporting endpoint (one per profile). */
export interface SproutReportingRow {
  profile_id: string;
  impressions: number;
  engagements: number;
  engagement_rate_by_impressions_percentage: number;
  net_follower_growth: number;
  video_views: number;
  messages_sent: number;
}

/** Response from the sprout-proxy /health endpoint. */
export interface SproutHealthResponse {
  ok: boolean;
  worker: string;
  has_token: boolean;
}
