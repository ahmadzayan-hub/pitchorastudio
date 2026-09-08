/**
 * Append-only audit log writer with row-hash chain.
 */

import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditEvent = {
  organization_id: string;
  user_id?: string;
  action: string;
  object_type?: string;
  object_id?: string;
  metadata?: Record<string, unknown>;
};

export async function writeAudit(supabase: SupabaseClient, ev: AuditEvent): Promise<void> {
  // Find previous hash for this org to chain.
  const { data: prev } = await supabase
    .from("pq_audit_logs")
    .select("row_hash")
    .eq("organization_id", ev.organization_id)
    .order("created_at", { ascending: false })
    .limit(1);

  const prevHash = prev?.[0]?.row_hash ?? "";
  const payload = {
    organization_id: ev.organization_id,
    user_id: ev.user_id ?? null,
    action: ev.action,
    object_type: ev.object_type ?? null,
    object_id: ev.object_id ?? null,
    metadata: ev.metadata ?? {},
    prev_row_hash: prevHash,
  };
  const row_hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  await supabase.from("pq_audit_logs").insert({ ...payload, row_hash });
}
