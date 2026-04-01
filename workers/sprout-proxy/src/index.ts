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

    // GET /profiles — list all connected social profiles
    // Cached 24 hours (profile list rarely changes)
    if (request.method === "GET" && url.pathname === "/profiles") {
      try {
        const sproutRes = await fetch(`${basePath}/analytics/profiles`, {
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
    // Body: { start_date: string, end_date: string, profile_ids: string[] }
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
        const sproutRes = await fetch(`${basePath}/analytics/reporting/profiles`, {
          method: "POST",
          headers: sproutHeaders(env.SPROUT_BEARER_TOKEN),
          body: JSON.stringify(body),
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
    // Body: { start_date: string, end_date: string, ... } (passed through to Sprout)
    // Cached 1 hour
    if (request.method === "POST" && url.pathname === "/posts") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const sproutRes = await fetch(`${basePath}/analytics/post`, {
          method: "POST",
          headers: sproutHeaders(env.SPROUT_BEARER_TOKEN),
          body: JSON.stringify(body),
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
