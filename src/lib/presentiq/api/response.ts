/**
 * Standard API response helpers.
 *
 * Rules of the wire format:
 *
 *  - 4xx/5xx bodies are always `{ error: { code, message, fields? } }`.
 *  - `code`      is a stable machine-readable slug (`invalid_input`,
 *                `forbidden`, `not_found`, …).
 *  - `message`   is a short, safe, human-readable string. NEVER contains
 *                stack traces, provider IDs, or internal enum shapes.
 *  - `fields`    is an optional, sanitised map of field-name → short
 *                per-field message. Used for form validation so the
 *                frontend can highlight the offending input without
 *                needing Zod internals.
 *
 * Anything richer (stack, Zod `expected/received/code/path`, DB error
 * text, provider raw response) is server-side-only. The dev console
 * still gets it; the wire never does. See THREAT_MODEL.md § 4.3 for
 * the information-disclosure classification.
 */

import { NextResponse } from "next/server";
import type { ZodIssue } from "zod";

export const json = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);

export const fail = (
  code: string,
  message: string,
  status = 400,
  fields?: Record<string, string>,
) => NextResponse.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });

/**
 * Convert Zod issues into a sanitised, wire-safe `fields` map without
 * leaking the internal `expected`/`received`/`code` shape. Also logs the
 * full detail server-side so dev/on-call can still debug.
 */
export function failValidation(
  message: string,
  issues: readonly ZodIssue[],
): NextResponse {
  const fields: Record<string, string> = {};
  for (const iss of issues) {
    const key = iss.path.join(".") || "_root";
    // Zod's own message is human-readable but occasionally leaks the
    // union enum (e.g. "Expected 'a' | 'b' | 'c'"). Strip the tail so
    // only the required-ness / cause is exposed.
    let msg = iss.message.split(",")[0].trim();
    if (msg.length > 140) msg = msg.slice(0, 137) + "...";
    if (!fields[key]) fields[key] = msg;
  }
  // Server-side log for on-call. `console.warn` shows in Vercel logs
  // and stays out of the wire.
  console.warn("[api] validation_failed", { issues });
  return fail("invalid_input", message, 400, fields);
}

export const unauthorized = () => fail("unauthorized", "Authentication required", 401);
export const forbidden = () => fail("forbidden", "Insufficient permissions", 403);
export const notFound = (what = "resource") => fail("not_found", `${what} not found`, 404);
