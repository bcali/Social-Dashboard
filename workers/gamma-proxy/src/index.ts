interface Env {
  GAMMA_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

const GAMMA_API_BASE = "https://public-api.gamma.app/v1.0";

function corsHeaders(origin: string, allowed: string): Record<string, string> {
  const isAllowed = origin === allowed || origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
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

    // POST /generate — proxy to Gamma generation API
    if (request.method === "POST" && url.pathname === "/generate") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        if (!body.inputText || typeof body.inputText !== "string") {
          return Response.json({ error: "Missing required field: inputText" }, { status: 400, headers: cors });
        }
        const gammaRes = await fetch(`${GAMMA_API_BASE}/generations`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-KEY": env.GAMMA_API_KEY },
          body: JSON.stringify(body),
        });
        const gammaData = await gammaRes.text();
        if (!gammaRes.ok) {
          return Response.json(
            { error: "Gamma API error", status: gammaRes.status, detail: gammaData || null },
            { status: gammaRes.status, headers: cors },
          );
        }
        return new Response(gammaData, { status: gammaRes.status, headers: { ...cors, "Content-Type": "application/json" } });
      } catch (err) {
        return Response.json({ error: "Proxy error", detail: (err as Error).message }, { status: 500, headers: cors });
      }
    }

    // GET /status/:id — proxy status check
    const statusMatch = url.pathname.match(/^\/status\/(.+)$/);
    if (request.method === "GET" && statusMatch) {
      try {
        const gammaRes = await fetch(`${GAMMA_API_BASE}/generations/${statusMatch[1]}`, {
          headers: { "X-API-KEY": env.GAMMA_API_KEY },
        });
        const gammaData = await gammaRes.text();
        return new Response(gammaData, { status: gammaRes.status, headers: { ...cors, "Content-Type": "application/json" } });
      } catch (err) {
        return Response.json({ error: "Status check failed", detail: (err as Error).message }, { status: 500, headers: cors });
      }
    }

    // Health check
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, worker: "gamma-proxy", has_key: !!env.GAMMA_API_KEY }, { headers: cors });
    }

    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  },
};
