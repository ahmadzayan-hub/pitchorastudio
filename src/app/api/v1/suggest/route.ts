import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { suggestForDraft, localizedSuggestion } from "@/lib/live-suggestions";

/**
 * Realtime suggestions endpoint.
 *
 *   POST /api/v1/suggest
 *   { draft, intent?, target_model?, locale?, limit? }
 *   → { api_version, suggestions: [{ id, kind, label, preview, append }] }
 *
 * Pure local engine — no LLM round-trip, no auth required, no PII stored.
 * Designed to be called on every keystroke from the browser extension's
 * floating button or the in-app live-suggestions chip strip.
 *
 * The endpoint is anonymous-friendly so the Grammarly-style content script
 * can fire it without a session.
 */
const Body = z.object({
  draft: z.string().max(20_000),
  intent: z.enum([
    "coding", "writing", "research", "analysis", "planning", "creative",
    "design", "conversation", "image", "video", "audio", "software",
    "website", "report", "other"
  ]).optional(),
  target_model: z.enum(["chatgpt", "claude", "copilot", "gemini", "generic"]).optional(),
  locale: z.enum(["en", "ar"]).optional(),
  limit: z.number().int().min(1).max(6).optional()
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    const result = Body.safeParse(await req.json());
    if (!result.success) {
      return NextResponse.json(
        { error: "invalid_body", issues: result.error.flatten() },
        { status: 400 }
      );
    }
    parsed = result.data;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { draft, intent, target_model, locale = "en", limit = 3 } = parsed;
  const raw = suggestForDraft(draft, { intent, targetModel: target_model, locale }, limit);
  return NextResponse.json({
    api_version: "v1",
    suggestions: raw.map((s) => localizedSuggestion(s, locale))
  }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
