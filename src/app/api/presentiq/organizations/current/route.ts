import { getRequestContext, getSupabase, writeAudit, isDemoContext } from "@/lib/presentiq";
import { fail, json, unauthorized } from "@/lib/presentiq/api/response";

export async function GET() {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  if (isDemoContext(ctx)) {
    return json({
      organization: {
        id: ctx.orgId,
        name: "Demo Workspace",
        plan: "trial",
        settings: {},
      },
    });
  }
  const supabase = await getSupabase();
  const { data } = await supabase.from("pq_organizations").select("*").eq("id", ctx.orgId).maybeSingle();
  return json({ organization: data });
}

export async function PATCH(req: Request) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  if (!["owner", "admin"].includes(ctx.role)) return fail("forbidden", "owner/admin only", 403);
  if (isDemoContext(ctx)) return fail("demo_readonly", "Demo workspace is read-only.", 400);
  const body = (await req.json().catch(() => ({}))) as { name?: string; settings?: Record<string, unknown> };
  const supabase = await getSupabase();
  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (body.settings && typeof body.settings === "object") patch.settings = body.settings;
  if (!Object.keys(patch).length) return fail("invalid_input", "no changes", 400);
  const { data, error } = await supabase
    .from("pq_organizations")
    .update(patch)
    .eq("id", ctx.orgId)
    .select()
    .single();
  if (error) return fail("update_failed", error.message, 500);
  await writeAudit(supabase, {
    organization_id: ctx.orgId, user_id: ctx.userId, action: "organization.update",
    object_type: "organization", object_id: ctx.orgId, metadata: patch,
  });
  return json({ organization: data });
}
