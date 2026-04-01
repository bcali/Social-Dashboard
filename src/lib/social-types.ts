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
