import { Image } from "lucide-react";
import { Badge } from "@/components/ui";

interface TopPost {
  id: string;
  hotel: string;
  channel: "facebook" | "instagram" | "tiktok";
  format: "video" | "image" | "carousel";
  engagement_rate: number;
  views: number | null;
}

interface TopPostsTableProps {
  posts?: TopPost[];
}

const CHANNEL_COLORS: Record<string, "primary" | "secondary" | "warning"> = {
  facebook: "primary",
  instagram: "secondary",
  tiktok: "warning",
};

export function TopPostsTable({ posts }: TopPostsTableProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="ui-card overflow-hidden">
        <div className="ui-section-title">Top Content</div>
        <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
          <Image size={32} className="mb-2 opacity-40" />
          <p className="text-sm font-semibold">Content Performance — Coming Soon</p>
          <p className="text-[11px] mt-1">Connect the Sprout Social API to see top-performing posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-card overflow-hidden">
      <div className="ui-section-title">Top Content</div>
      <div className="overflow-x-auto">
        <table className="ui-table w-full">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Channel</th>
              <th>Format</th>
              <th className="text-right">Eng. Rate</th>
              <th className="text-right">Views</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="font-semibold text-[var(--text-primary)]">{post.hotel}</td>
                <td>
                  <Badge color={CHANNEL_COLORS[post.channel] ?? "primary"}>{post.channel.toUpperCase()}</Badge>
                </td>
                <td className="capitalize">{post.format}</td>
                <td className="text-right font-mono">{post.engagement_rate.toFixed(1)}%</td>
                <td className="text-right font-mono">{post.views != null ? post.views.toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
