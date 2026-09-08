import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";
import { demoFlashcards } from "@/lib/demo";

export async function GET(req: NextRequest) {
  const packId = req.nextUrl.searchParams.get("pack_id");
  const demo = demoFlashcards(packId); if (demo) return demo;
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  let query = supabase
    .from("flashcards")
    .select("*, study_packs(topic, courses(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (packId) query = query.eq("pack_id", packId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cards = (data || []).map((c: any) => ({
    ...c,
    pack_topic: c.study_packs?.topic,
    course_name: c.study_packs?.courses?.name,
  }));
  return NextResponse.json(cards);
}
