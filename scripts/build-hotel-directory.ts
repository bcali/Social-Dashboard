/**
 * Fetches all Sprout Social profiles and builds data/hotels.json.
 *
 * Usage: npx tsx scripts/build-hotel-directory.ts
 */

const PROXY_URL = "https://sprout-proxy.brianc-uw.workers.dev";

interface SproutProfile {
  customer_profile_id: number;
  network_type: string;
  name: string;
  native_name: string;
  link: string;
  native_id: string;
  groups: number[];
}

interface HotelDirectoryEntry {
  hotel_id: string;
  name: string;
  brand: string;
  region: string;
  country: string;
  profile_ids: string[];
  channels: Record<string, "facebook" | "instagram" | "tiktok">;
}

const CHANNEL_MAP: Record<string, "facebook" | "instagram" | "tiktok" | null> = {
  facebook: "facebook",
  fb_instagram_account: "instagram",
  tiktok: "tiktok",
  pinterest: null,
  youtube: null,
  linkedin_company: null,
  linkedin: null,
};

function inferBrand(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("anantara")) return "AN";
  if (n.includes("avani")) return "AV";
  if (n.includes("tivoli")) return "TV";
  if (n.includes("nhow") || n.startsWith("nhow")) return "NW";
  if (n.includes("nh collection")) return "NC";
  if (n.includes("nh ")) return "NH";
  if (n.includes("niyama")) return "AN";
  if (n.includes("naladhu")) return "AN";
  if (n.includes("oaks")) return "OA";
  if (n.includes("elewana")) return "EL";
  return "OT";
}

function normalizeName(name: string): string {
  return name
    .replace(/\s*\(.*\)$/, "") // strip parenthetical location info
    .replace(/[+]/g, "")
    .trim();
}

async function main() {
  console.log("Fetching profiles from", PROXY_URL);
  const res = await fetch(`${PROXY_URL}/profiles`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const { data: profiles } = (await res.json()) as { data: SproutProfile[] };
  console.log(`Fetched ${profiles.length} profiles`);

  // Filter to social channels only (FB, IG, TikTok)
  const socialProfiles = profiles.filter((p) => CHANNEL_MAP[p.network_type] !== null && CHANNEL_MAP[p.network_type] !== undefined);
  console.log(`${socialProfiles.length} social profiles (FB/IG/TikTok)`);

  // Group by normalized name
  const groups = new Map<string, SproutProfile[]>();
  for (const p of socialProfiles) {
    const key = normalizeName(p.name);
    const existing = groups.get(key);
    if (existing) {
      existing.push(p);
    } else {
      groups.set(key, [p]);
    }
  }
  console.log(`${groups.size} unique property names`);

  // Build hotel directory
  const hotels: HotelDirectoryEntry[] = [];
  let idx = 1;

  for (const [name, profs] of groups) {
    const profileIds = profs.map((p) => String(p.customer_profile_id));
    const channels: Record<string, "facebook" | "instagram" | "tiktok"> = {};
    for (const p of profs) {
      const ch = CHANNEL_MAP[p.network_type];
      if (ch) channels[String(p.customer_profile_id)] = ch;
    }

    hotels.push({
      hotel_id: `sprout_${String(idx).padStart(4, "0")}`,
      name,
      brand: inferBrand(name),
      region: "Global",
      country: "",
      profile_ids: profileIds,
      channels,
    });
    idx++;
  }

  // Sort by brand then name
  hotels.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));

  // Write to data/hotels.json
  const fs = await import("node:fs");
  const path = await import("node:path");
  const outPath = path.join(import.meta.dirname!, "..", "data", "hotels.json");
  fs.writeFileSync(outPath, JSON.stringify(hotels, null, 2) + "\n");
  console.log(`Wrote ${hotels.length} hotels to ${outPath}`);

  // Summary by brand
  const brandCounts: Record<string, number> = {};
  for (const h of hotels) brandCounts[h.brand] = (brandCounts[h.brand] || 0) + 1;
  console.log("By brand:", brandCounts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
