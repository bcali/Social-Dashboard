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

/**
 * Normalized reporting row (one per profile, aggregated across the date range).
 * The sprout-client normalizes daily Sprout API rows into this shape.
 */
export interface SproutReportingRow {
  profile_id: string;
  impressions: number;
  engagements: number;
  engagement_rate_by_impressions_percentage: number;
  net_follower_growth: number;
  video_views: number;
  messages_sent: number;
}

/** Raw row from the Sprout Analytics API (daily, per profile). */
export interface SproutRawDataRow {
  dimensions: {
    customer_profile_id: number;
    "reporting_period.by(day)": string;
  };
  metrics: {
    impressions?: number;
    engagements?: number;
    net_follower_growth?: number;
    video_views?: number;
    reactions?: number;
    post_impressions?: number;
  };
}

/** Raw response wrapper from Sprout Analytics API. */
export interface SproutAnalyticsResponse {
  data: SproutRawDataRow[];
  paging?: { current_page: number; total_pages: number };
}

/** Raw profile entry from Sprout /metadata/customer. */
export interface SproutApiProfile {
  customer_profile_id: number;
  network_type: string;
  name: string;
  native_name: string;
  link: string;
  native_id: string;
  groups: number[];
}

/** Response from the sprout-proxy /health endpoint. */
export interface SproutHealthResponse {
  ok: boolean;
  worker: string;
  has_token: boolean;
}
