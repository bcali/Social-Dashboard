interface Env {
  SPROUT_BEARER_TOKEN: string;
  SPROUT_CUSTOMER_ID: string;
  ALLOWED_ORIGIN: string;
}

const SPROUT_API_BASE = "https://api.sproutsocial.com/v1";

function corsHeaders(origin: string, allowed: string): Record<string, string> {
  const isAllowed = origin === allowed || origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function sproutHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

/**
 * Builds Sprout filter DSL for profile analytics.
 * Converts simple { start_date, end_date, profile_ids? } into Sprout's filter array format.
 */
function buildReportingBody(input: {
  start_date: string;
  end_date: string;
  profile_ids?: string[];
  metrics?: string[];
}): Record<string, unknown> {
  const filters: string[] = [
    `reporting_period.in(${input.start_date}...${input.end_date})`,
  ];

  if (input.profile_ids?.length) {
    filters.push(`customer_profile_id.eq(${input.profile_ids.join(",")})`);
  }

  return {
    filters,
    metrics: input.metrics ?? [
      "impressions",
      "engagements",
      "net_follower_growth",
      "video_views",
      "reactions",
      "post_impressions",
    ],
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const basePath = `${SPROUT_API_BASE}/${env.SPROUT_CUSTOMER_ID}`;

    // GET /health — health check
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json(
        { ok: true, worker: "sprout-proxy", has_token: !!env.SPROUT_BEARER_TOKEN },
        { headers: cors },
      );
    }

    // GET /profiles — list all connected social profiles via metadata endpoint
    // Cached 24 hours (profile list rarely changes)
    if (request.method === "GET" && url.pathname === "/profiles") {
      try {
        const sproutRes = await fetch(`${basePath}/metadata/customer`, {
          headers: sproutHeaders(env.SPROUT_BEARER_TOKEN),
        });
        const data = await sproutRes.text();
        if (!sproutRes.ok) {
          return Response.json(
            { error: "Sprout API error", status: sproutRes.status, detail: data || null },
            { status: sproutRes.status, headers: cors },
          );
        }
        return new Response(data, {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
        });
      } catch (err) {
        return Response.json({ error: "Proxy error", detail: (err as Error).message }, { status: 500, headers: cors });
      }
    }

    // POST /reporting — aggregate metrics per profile for a date range
    // Body: { start_date: string, end_date: string, profile_ids?: string[], metrics?: string[] }
    // Translates to Sprout filter DSL and POSTs to /analytics/profiles
    // Cached 1 hour
    if (request.method === "POST" && url.pathname === "/reporting") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        if (!body.start_date || !body.end_date) {
          return Response.json(
            { error: "Missing required fields: start_date, end_date" },
            { status: 400, headers: cors },
          );
        }
        const sproutBody = buildReportingBody(body as {
          start_date: string;
          end_date: string;
          profile_ids?: string[];
          metrics?: string[];
        });
        const sproutRes = await fetch(`${basePath}/analytics/profiles`, {
          method: "POST",
          headers: sproutHeaders(env.SPROUT_BEARER_TOKEN),
          body: JSON.stringify(sproutBody),
        });
        const data = await sproutRes.text();
        if (!sproutRes.ok) {
          return Response.json(
            { error: "Sprout API error", status: sproutRes.status, detail: data || null },
            { status: sproutRes.status, headers: cors },
          );
        }
        return new Response(data, {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
        });
      } catch (err) {
        return Response.json({ error: "Proxy error", detail: (err as Error).message }, { status: 500, headers: cors });
      }
    }

    // POST /posts — top posts by metric
    // Body: { start_date, end_date, profile_ids?, metrics?, sort?, fields? }
    // Translates to Sprout filter DSL and POSTs to /analytics/posts
    // Cached 1 hour
    if (request.method === "POST" && url.pathname === "/posts") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const filters: string[] = [];
        if (body.start_date && body.end_date) {
          filters.push(`created_time.in(${body.start_date}T00:00:00..${body.end_date}T23:59:59)`);
        }
        if (Array.isArray(body.profile_ids) && body.profile_ids.length) {
          filters.push(`customer_profile_id.eq(${(body.profile_ids as string[]).join(",")})`);
        }

        const sproutBody: Record<string, unknown> = {
          filters,
          fields: body.fields ?? ["created_time", "perma_link", "text"],
          metrics: body.metrics ?? ["lifetime.impressions", "lifetime.engagements", "lifetime.reactions"],
          sort: body.sort ?? ["lifetime.engagements:desc"],
        };

        const sproutRes = await fetch(`${basePath}/analytics/posts`, {
          method: "POST",
          headers: sproutHeaders(env.SPROUT_BEARER_TOKEN),
          body: JSON.stringify(sproutBody),
        });
        const data = await sproutRes.text();
        if (!sproutRes.ok) {
          return Response.json(
            { error: "Sprout API error", status: sproutRes.status, detail: data || null },
            { status: sproutRes.status, headers: cors },
          );
        }
        return new Response(data, {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
        });
      } catch (err) {
        return Response.json({ error: "Proxy error", detail: (err as Error).message }, { status: 500, headers: cors });
      }
    }

    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  },
};
