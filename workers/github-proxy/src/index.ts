interface Env {
  GITHUB_PAT: string;
  ALLOWED_ORIGIN: string;
  REPO_OWNER: string;
  REPO_NAME: string;
}

const GITHUB_API = "https://api.github.com";

function corsHeaders(origin: string, allowed: string): Record<string, string> {
  const isAllowed = origin === allowed || origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

async function getFileContent(env: Env, filePath: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${GITHUB_API}/repos/${env.REPO_OWNER}/${env.REPO_NAME}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${env.GITHUB_PAT}`, Accept: "application/vnd.github.v3+json", "User-Agent": "github-proxy-worker" },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GitHub GET failed (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  return { content: atob(data.content.replace(/\n/g, "")), sha: data.sha };
}

async function commitFile(env: Env, filePath: string, content: string, sha: string, message: string): Promise<{ sha: string }> {
  const encoded = btoa(unescape(encodeURIComponent(content)));
  const res = await fetch(`${GITHUB_API}/repos/${env.REPO_OWNER}/${env.REPO_NAME}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.GITHUB_PAT}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "github-proxy-worker",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content: encoded, sha }),
  });
  if (res.status === 409) {
    throw new Error("File was modified on GitHub since you loaded it. Please reload and try again.");
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GitHub PUT failed (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { content: { sha: string } };
  return { sha: data.content.sha };
}

// --- Add your own commit handlers here ---
// Example: handleCommitEntry, handleCreateEntry, etc.
// See the roadmap-dashboard github-proxy worker for reference patterns.

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // Health check
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json(
        { ok: true, worker: "github-proxy", has_pat: !!env.GITHUB_PAT, repo: `${env.REPO_OWNER}/${env.REPO_NAME}` },
        { headers: cors },
      );
    }

    // --- Add your routes here ---
    // if (request.method === "POST" && url.pathname === "/commit-data") { ... }

    return Response.json({ error: "Not found" }, { status: 404, headers: cors });
  },
};

// Export utilities for use in route handlers
export { getFileContent, commitFile };
