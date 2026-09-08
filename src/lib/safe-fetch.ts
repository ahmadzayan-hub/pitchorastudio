/**
 * Defensive fetch wrapper that never throws on non-JSON / empty bodies.
 * Returns a normalised envelope so UIs can render a friendly error.
 */
export interface SafeResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: { code?: string; message: string; hint?: string };
}

export async function safeFetch<T = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<SafeResult<T>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: { message: "network_error", hint: String(e) }
    };
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // body present but not JSON — surface a sliced preview, no crash
      return {
        ok: false,
        status: res.status,
        data: null,
        error: {
          code: "non_json_response",
          message: `Server returned non-JSON (${res.status})`,
          hint: text.slice(0, 200)
        }
      };
    }
  }

  if (!res.ok) {
    const p = (parsed ?? {}) as Record<string, unknown>;
    return {
      ok: false,
      status: res.status,
      data: null,
      error: {
        code: typeof p.error === "string" ? p.error : `http_${res.status}`,
        message:
          typeof p.message === "string"
            ? p.message
            : typeof p.error === "string"
              ? p.error
              : `Request failed (${res.status})`,
        hint: typeof p.hint === "string" ? p.hint : undefined
      }
    };
  }

  // The API now returns 200 with `{ unavailable: true }` when the backend isn't
  // configured, so Vercel doesn't flag it as a 5xx error. The client treats
  // that envelope as "fall through to local mode."
  const p = (parsed ?? {}) as Record<string, unknown>;
  if (p.unavailable === true) {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: {
        code: typeof p.reason === "string" ? p.reason : "unavailable",
        message: typeof p.message === "string" ? p.message : "Backend unavailable",
        hint: typeof p.hint === "string" ? p.hint : undefined
      }
    };
  }

  return { ok: true, status: res.status, data: (parsed as T) ?? null };
}
