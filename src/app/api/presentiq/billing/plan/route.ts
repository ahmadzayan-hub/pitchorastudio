import { getRequestContext, getSupabase, getPlan, isDemoContext } from "@/lib/presentiq";
import { json, unauthorized } from "@/lib/presentiq/api/response";

export async function GET() {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();

  // Demo mode: no Supabase wired. Return the trial plan with no usage so the
  // billing screen renders without throwing the env-not-configured error.
  if (isDemoContext(ctx)) {
    return json({
      plan: getPlan("trial"),
      subscription: null,
      usage: {},
    });
  }

  const supabase = await getSupabase();
  const [{ data: org }, { data: sub }] = await Promise.all([
    supabase.from("pq_organizations").select("plan, settings").eq("id", ctx.orgId).maybeSingle(),
    supabase.from("pq_subscriptions").select("*").eq("organization_id", ctx.orgId).maybeSingle(),
  ]);
  return json({
    plan: getPlan((org?.plan as any) ?? "trial"),
    subscription: sub,
    usage: org?.settings?.usage ?? {},
  });
}
