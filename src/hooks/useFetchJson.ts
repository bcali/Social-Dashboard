import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.BASE_URL || "/";

export function useFetchJson<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
        if (!res.ok) {
          if (!controller.signal.aborted) {
            setError(`Data unavailable (HTTP ${res.status})`);
          }
          return;
        }
        const json = await res.json();
        if (!controller.signal.aborted) {
          setData(json);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Network error");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [path]);

  return { data, loading, error };
}
