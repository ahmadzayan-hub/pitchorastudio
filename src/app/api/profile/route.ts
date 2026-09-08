export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";
import { demoReturn } from "@/lib/demo";

export async function GET() {
  const demo = demoReturn("profile"); if (demo) return demo;
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const { data } = await supabase
    .from("users")
    .select("full_name, avatar_url, email")
    .eq("id", user.id)
    .single();

  return NextResponse.json(data || {});
}

export async function PUT(req: NextRequest) {
  const demo = demoReturn("profile"); if (demo) return demo;
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const { full_name, avatar_url } = await req.json();

  const { data, error } = await supabase
    .from("users")
    .update({ full_name, avatar_url })
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
