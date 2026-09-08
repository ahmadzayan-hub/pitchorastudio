import { NextResponse } from "next/server";
import { LlmUnreachableError } from "@/lib/llm/ollama";
import { isSupabaseConfigured } from "@/lib/env";

const SUPABASE_NOT_CONFIGURED =
  /Supabase env not configured|SUPABASE_SERVICE_ROLE_KEY not configured/i;

/**
 * Translate engine errors into clean HTTP responses.
 *
 * Crucially, if the cause is "backend not configured" (the default state of
 * a free-tier Vercel deploy without Supabase), we return HTTP 200 with an
 * `{ unavailable: true }` envelope. The client's safe-fetch normalises this
 * to a fall-through, and Vercel's metrics no longer flag it as a 5xx.
 */
export function handleError(e: unknown): NextResponse {
  if (e instanceof LlmUnreachableError) {
    return NextResponse.json(
      {
        unavailable: true,
        reason: "llm_unreachable",
        message: e.message,
        hint:
          "Start Ollama locally (`ollama serve`) or set OLLAMA_BASE_URL to a reachable endpoint.",
        base_url: e.baseUrl
      },
      { status: 200 }
    );
  }
  const msg = (e as Error)?.message ?? "";
  if (SUPABASE_NOT_CONFIGURED.test(msg)) {
    return NextResponse.json(
      { unavailable: true, reason: "backend_not_configured", message: msg },
      { status: 200 }
    );
  }
  console.error("[api]", e);
  return NextResponse.json({ error: "internal", message: msg }, { status: 500 });
}

/**
 * Wrap a route handler so any thrown error — including the "Supabase env not
 * configured" case from importing the server client — surfaces as a graceful
 * 200 with `{ unavailable: true }` instead of a Vercel 5xx.
 */
export function safeRoute<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse> | NextResponse
) {
  return async (...args: Args): Promise<NextResponse> => {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          unavailable: true,
          reason: "backend_not_configured",
          message: "Backend not configured — running in local mode."
        },
        { status: 200 }
      );
    }
    try {
      return await handler(...args);
    } catch (e) {
      return handleError(e);
    }
  };
}
