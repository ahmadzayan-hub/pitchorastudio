export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireUser, createServiceClient } from "@/lib/db/supabase-server";

export async function POST() {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const admin = createServiceClient();

  await admin.from("deletion_requests").insert({
    user_id: user.id,
    status: "pending",
    requested_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, message: "Deletion request submitted." });
}
