export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";

export async function POST(req: NextRequest) {
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const { full_name, program_name, university, gpa_scale, study_hours_per_week, primary_language, goal } = await req.json();

  await supabase.from("users").update({ full_name }).eq("id", user.id);

  await supabase.from("academic_profiles").upsert({
    user_id: user.id,
    program_name,
    university,
    gpa_scale,
    study_hours_per_week,
    primary_language,
    goal,
    onboarding_completed: true,
  }, { onConflict: "user_id" });

  return NextResponse.json({ ok: true });
}
