import { getRequestContext, getSupabase, isDemoContext } from "@/lib/presentiq";
import { fail, json, unauthorized } from "@/lib/presentiq/api/response";

export async function GET(req: Request) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  if (!["owner", "admin"].includes(ctx.role)) return fail("forbidden", "owner/admin only", 403);
  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? "50")));
  const action = url.searchParams.get("action");

  // Demo mode: no Supabase. The audit table doesn't exist locally, so return
  // an empty list rather than throwing.
  if (isDemoContext(ctx)) {
    return json({ items: [] });
  }

  const supabase = await getSupabase();
  let query = supabase
    .from("pq_audit_logs")
    .select("id, action, object_type, object_id, user_id, metadata, created_at")
    .eq("organization_id", ctx.orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (action) query = query.eq("action", action);
  const { data } = await query;
  return json({ items: data ?? [] });
}
