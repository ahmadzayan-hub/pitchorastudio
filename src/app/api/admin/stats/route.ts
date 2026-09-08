export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getUser } from "@/lib/db/supabase-server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ totalUsers: 847, activeSubscriptions: 312, trialUsers: 94, aiCostThisMonth: 128.47, storageUsedGB: 24.3, failedJobs: 2 });
  }

  // Fail closed if the service role key is not configured. Silently
  // falling back to the anon key would run admin queries under
  // ordinary RLS and return inconsistent results (or nothing) rather
  // than an honest 503. See THREAT_MODEL.md § 4.3 / § 5 G2.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "admin_service_role_key_missing" },
      { status: 503 },
    );
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Check admin role
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (userData?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [{ count: totalUsers }, { count: activeSubscriptions }, aiCost] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).in("status", ["active","trialing"]),
    supabase.from("ai_usage_logs").select("cost_usd").gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const totalCost = (aiCost.data ?? []).reduce((s: number, r: any) => s + (r.cost_usd ?? 0), 0);

  return NextResponse.json({ totalUsers: totalUsers ?? 0, activeSubscriptions: activeSubscriptions ?? 0, trialUsers: 0, aiCostThisMonth: totalCost, storageUsedGB: 0, failedJobs: 0 });
}
