import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";
import { aiChat } from "@/lib/ai/client";
import { demoReturn } from "@/lib/demo";

export async function GET() {
  const demo = demoReturn("quizzes"); if (demo) return demo;
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, study_packs(topic, courses(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const quizzes = (data || []).map((q: any) => ({
    ...q,
    pack_topic: q.study_packs?.topic,
    course_name: q.study_packs?.courses?.name,
  }));
  return NextResponse.json(quizzes);
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    const { pack_id } = await req.json();
    return NextResponse.json({ id: `quiz-${Date.now()}`, user_id: "demo-user", pack_id, title: "New Quiz", status: "ready", questions: [], num_questions: 0, created_at: new Date().toISOString() }, { status: 201 });
  }
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const { pack_id, num_questions = 10 } = await req.json();

  if (!pack_id) return NextResponse.json({ error: "pack_id required" }, { status: 400 });

  const { data: pack } = await supabase
    .from("study_packs")
    .select("*, study_packs_flashcards:flashcards(*)")
    .eq("id", pack_id)
    .eq("user_id", user.id)
    .single();

  if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

  const context = `Topic: ${pack.topic}\nOverview: ${pack.overview || ""}\nKey notes: ${(pack.key_notes || []).join("; ")}\nGlossary: ${JSON.stringify(pack.glossary || {})}`;

  const prompt = `Generate ${num_questions} multiple-choice quiz questions based on this MBA study pack. Return valid JSON array only with no markdown.
Format: [{"q":"question","options":["A","B","C","D"],"answer":0,"explanation":"why this is correct"}]
The "answer" field is the 0-based index of the correct option.

Study pack context:
${context}`;

  const response = await aiChat([{ role: "user", content: prompt }], { maxTokens: 3000 });
  
  let questions: any[] = [];
  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("no array");
    questions = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(questions)) throw new Error("not array");
  } catch {
    return NextResponse.json({ error: "Failed to parse quiz questions" }, { status: 500 });
  }

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({
      user_id: user.id,
      pack_id,
      title: `${pack.topic} Quiz`,
      questions,
      num_questions: questions.length,
      status: "ready",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(quiz, { status: 201 });
}
