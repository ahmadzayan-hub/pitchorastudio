import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/db/supabase-server";
import { createServiceClient } from "@/lib/db/supabase-server";
import { demoReturn } from "@/lib/demo";

export async function GET() {
  const demo = demoReturn("files"); if (demo) return demo;
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;
  const { data, error } = await supabase
    .from("private_files")
    .select("*, courses(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const files = (data || []).map((f: any) => ({ ...f, course_name: f.courses?.name }));
  return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    return NextResponse.json({ id: `file-${Date.now()}`, user_id: "demo-user", file_name: file?.name ?? "demo.pdf", file_type: file?.type ?? "application/pdf", file_size: file?.size ?? 0, processing_status: "ready", chunk_count: 10, created_at: new Date().toISOString() }, { status: 201 });
  }
  const { user, supabase, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const courseId = formData.get("course_id") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  // Upload to Supabase Storage
  const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("private-files")
    .upload(path, bytes, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Create DB record
  const { data, error } = await supabase
    .from("private_files")
    .insert({
      user_id: user.id,
      course_id: courseId || null,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: path,
      processing_status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Trigger async processing (fire and forget)
  processFile(data.id, path, file.type, user.id).catch(console.error);

  return NextResponse.json(data, { status: 201 });
}

async function processFile(fileId: string, storagePath: string, fileType: string, userId: string) {
  const adminClient = createServiceClient();

  await adminClient.from("private_files").update({ processing_status: "processing" }).eq("id", fileId);

  try {
    const { data: fileData } = await adminClient.storage.from("private-files").download(storagePath);
    if (!fileData) throw new Error("Could not download file");

    const text = await fileData.text();
    if (!text.trim()) throw new Error("Empty file content");

    // Chunk text (simple paragraph-based chunking)
    const chunks = chunkText(text, 800, 100);

    // Get embeddings and store
    const { getEmbedding } = await import("@/lib/ai/client");

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i]);
      await adminClient.from("document_chunks").insert({
        file_id: fileId,
        user_id: userId,
        chunk_index: i,
        content: chunks[i],
        embedding,
        token_count: Math.ceil(chunks[i].length / 4),
      });
    }

    await adminClient.from("private_files").update({ processing_status: "ready", chunk_count: chunks.length }).eq("id", fileId);
  } catch (err) {
    console.error("File processing error:", err);
    await adminClient.from("private_files").update({ processing_status: "failed" }).eq("id", fileId);
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start = end - overlap;
  }

  return chunks.filter(c => c.length > 50);
}
