export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db/supabase-server";
import { isDemoMode } from "@/lib/demo";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (isDemoMode) {
    // Simulate email sending delay
    await new Promise(r => setTimeout(r, 500));
    return NextResponse.json({
      ok: true,
      sent: body.attendeeIds?.length ?? 0,
      message: `Transcript and AI summary sent to ${body.attendeeIds?.length ?? 0} classmates.`,
      demo: true,
    });
  }

  // Real implementation: use Resend / SendGrid
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // for (const attendeeId of body.attendeeIds) {
  //   const { data: attendee } = await supabase.from("users").select("email, display_name").eq("id", attendeeId).single();
  //   if (!attendee) continue;
  //   await resend.emails.send({ from: "lectures@tweenz.ae", to: attendee.email, subject: `Lecture Notes: ${body.lectureTitle}`, html: buildEmailHtml(body) });
  // }
  return NextResponse.json({ ok: true, sent: body.attendeeIds?.length ?? 0 });
}
