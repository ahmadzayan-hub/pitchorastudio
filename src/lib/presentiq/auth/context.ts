/**
 * Resolve the current user + org from the Supabase session.
 *
 * Used by every API route that performs tenant-scoped reads/writes.
 * RLS still enforces isolation; this is for application-level access checks
 * and audit logging.
 *
 * Demo mode: when Supabase env is missing OR there is no logged-in user,
 * we return a synthetic demo context so the trial wizard, dashboard,
 * brand kits and slide generation work end-to-end without any setup.
 */

import { getSupabase } from "../storage/supabase";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../demo/store";

export type RequestContext = {
  userId: string;
  orgId: string;
  email: string;
  role: "owner" | "admin" | "editor" | "reviewer" | "viewer";
  isDemo?: boolean;
};

const DEMO_CONTEXT: RequestContext = {
  userId: DEMO_USER_ID,
  orgId: DEMO_ORG_ID,
  email: "trial@presentiq.local",
  role: "owner",
  isDemo: true,
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export async function getRequestContext(): Promise<RequestContext> {
  // Trial / demo path — when Supabase is not configured, always return demo.
  if (!isSupabaseConfigured()) return DEMO_CONTEXT;

  try {
    const supabase = await getSupabase();
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult?.user;
    if (!user) return DEMO_CONTEXT;

    const { data: row } = await supabase
      .from("pq_users")
      .select("organization_id, role, email, name")
      .eq("id", user.id)
      .maybeSingle();

    // First-login bootstrap: if pq_users row doesn't exist, create a personal org.
    if (!row) {
      const created = await bootstrapUser(supabase, user.id, user.email ?? "");
      if (!created) return DEMO_CONTEXT;
      return { userId: user.id, orgId: created.org_id, email: user.email ?? "", role: "owner" };
    }

    return {
      userId: user.id,
      orgId: row.organization_id,
      email: row.email ?? user.email ?? "",
      role: (row.role ?? "editor") as RequestContext["role"],
    };
  } catch {
    return DEMO_CONTEXT;
  }
}

async function bootstrapUser(
  supabase: any,
  userId: string,
  email: string,
): Promise<{ org_id: string } | null> {
  const slug = (email.split("@")[0] || "user") + "-" + userId.slice(0, 8);
  const { data: org } = await supabase
    .from("pq_organizations")
    .insert({ name: email || "My Workspace", slug, plan: "trial" })
    .select()
    .single();
  if (!org) return null;
  await supabase.from("pq_users").insert({
    id: userId,
    organization_id: org.id,
    name: email,
    email,
    role: "owner",
  });
  await supabase.from("pq_subscriptions").insert({
    organization_id: org.id,
    plan: "trial",
    status: "trialing",
    provider: "stripe",
    trial_ends_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  return { org_id: org.id };
}

export function requireRole(ctx: RequestContext, ...allowed: RequestContext["role"][]): boolean {
  return allowed.includes(ctx.role);
}

export function isDemoContext(ctx: RequestContext): boolean {
  return ctx.isDemo === true || ctx.orgId === DEMO_ORG_ID;
}
